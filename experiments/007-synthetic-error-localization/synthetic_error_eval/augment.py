from __future__ import annotations

import hashlib
import math
import subprocess
from pathlib import Path

import numpy as np


SAMPLE_RATE_HZ = 16_000
AUGMENTATION_NAMES = (
    "clean",
    "quiet_room",
    "cafe_crosstalk",
    "street_noise",
    "hvac_hum",
    "strong_hiss",
    "clipped_mic",
    "packet_dropouts",
    "phone_band",
    "fast_pitch",
    "slow_pitch",
)


def stable_seed(*parts: str) -> int:
    digest = hashlib.sha256(":".join(parts).encode("utf-8")).digest()
    return int.from_bytes(digest[:8], "big")


def decode_wav(path: Path) -> np.ndarray:
    """Decode any generator WAV to mono 16 kHz float audio with FFmpeg."""

    completed = subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(path),
            "-f",
            "s16le",
            "-acodec",
            "pcm_s16le",
            "-ar",
            str(SAMPLE_RATE_HZ),
            "-ac",
            "1",
            "pipe:1",
        ],
        check=True,
        capture_output=True,
    )
    pcm = np.frombuffer(completed.stdout, dtype="<i2").astype(np.float32)
    if pcm.size == 0:
        raise ValueError(f"FFmpeg decoded no samples from {path}")
    signal = pcm / 32768.0
    peak = float(np.max(np.abs(signal)))
    if peak > 0:
        signal = signal * (0.82 / peak)
    return signal.astype(np.float32)


def _rms(signal: np.ndarray) -> float:
    return float(np.sqrt(np.mean(np.square(signal, dtype=np.float64))))


def _mix_at_snr(
    signal: np.ndarray,
    interference: np.ndarray,
    snr_db: float,
) -> np.ndarray:
    signal_rms = _rms(signal)
    noise_rms = _rms(interference)
    if signal_rms == 0 or noise_rms == 0:
        return signal.copy()
    scale = signal_rms / (noise_rms * 10 ** (snr_db / 20))
    return signal + interference * scale


def _white_noise(length: int, rng: np.random.Generator) -> np.ndarray:
    return rng.normal(0.0, 1.0, length).astype(np.float32)


def _pink_noise(length: int, rng: np.random.Generator) -> np.ndarray:
    white = rng.normal(0.0, 1.0, length)
    spectrum = np.fft.rfft(white)
    frequencies = np.fft.rfftfreq(length, d=1 / SAMPLE_RATE_HZ)
    scale = np.ones_like(frequencies)
    scale[1:] = 1 / np.sqrt(frequencies[1:])
    pink = np.fft.irfft(spectrum * scale, n=length)
    pink -= np.mean(pink)
    return pink.astype(np.float32)


def _brown_noise(length: int, rng: np.random.Generator) -> np.ndarray:
    brown = np.cumsum(rng.normal(0.0, 1.0, length))
    brown -= np.mean(brown)
    standard_deviation = float(np.std(brown))
    if standard_deviation:
        brown /= standard_deviation
    return brown.astype(np.float32)


def _fit_donor(
    donor: np.ndarray,
    length: int,
    rng: np.random.Generator,
) -> np.ndarray:
    if donor.size < length:
        donor = np.tile(donor, math.ceil(length / donor.size))
    maximum_start = max(0, donor.size - length)
    start = int(rng.integers(0, maximum_start + 1)) if maximum_start else 0
    return donor[start : start + length].copy()


def _echo(signal: np.ndarray) -> np.ndarray:
    result = signal.astype(np.float64).copy()
    for delay_seconds, gain in ((0.055, 0.22), (0.11, 0.12), (0.19, 0.07)):
        delay = round(delay_seconds * SAMPLE_RATE_HZ)
        result[delay:] += signal[:-delay] * gain
    return result.astype(np.float32)


def _phone_band(signal: np.ndarray) -> np.ndarray:
    spectrum = np.fft.rfft(signal)
    frequencies = np.fft.rfftfreq(signal.size, d=1 / SAMPLE_RATE_HZ)
    transition = np.ones_like(frequencies)
    transition[frequencies < 220] = 0
    transition[frequencies > 3_600] = 0
    low_ramp = (frequencies >= 220) & (frequencies < 350)
    high_ramp = (frequencies > 3_200) & (frequencies <= 3_600)
    transition[low_ramp] = (frequencies[low_ramp] - 220) / 130
    transition[high_ramp] = (3_600 - frequencies[high_ramp]) / 400
    banded = np.fft.irfft(spectrum * transition, n=signal.size)
    quantized = np.round(np.clip(banded, -1, 1) * 127) / 127
    return quantized.astype(np.float32)


def _resample_pitch(signal: np.ndarray, factor: float) -> np.ndarray:
    output_length = max(1, round(signal.size / factor))
    source_positions = np.linspace(0, signal.size - 1, output_length)
    return np.interp(
        source_positions,
        np.arange(signal.size),
        signal,
    ).astype(np.float32)


def _finalize(signal: np.ndarray) -> np.ndarray:
    signal = np.nan_to_num(signal, nan=0.0, posinf=0.98, neginf=-0.98)
    peak = float(np.max(np.abs(signal))) if signal.size else 0.0
    if peak > 0.98:
        signal = signal * (0.98 / peak)
    padding = np.zeros(round(0.25 * SAMPLE_RATE_HZ), dtype=np.float32)
    return np.concatenate((padding, signal.astype(np.float32), padding))


def augment(
    signal: np.ndarray,
    name: str,
    seed: int,
    donor: np.ndarray | None = None,
) -> np.ndarray:
    if name not in AUGMENTATION_NAMES:
        raise ValueError(f"unknown augmentation: {name}")
    rng = np.random.default_rng(seed)

    if name == "clean":
        result = signal.copy()
    elif name == "quiet_room":
        result = _mix_at_snr(_echo(signal), _pink_noise(signal.size, rng), 30.0)
    elif name == "cafe_crosstalk":
        if donor is None:
            raise ValueError("cafe_crosstalk requires a donor voice")
        babble = _fit_donor(donor, signal.size, rng)
        result = _mix_at_snr(signal, babble, 6.0)
        result = _mix_at_snr(result, _pink_noise(signal.size, rng), 24.0)
    elif name == "street_noise":
        result = _mix_at_snr(signal, _brown_noise(signal.size, rng), 8.0)
    elif name == "hvac_hum":
        time_axis = np.arange(signal.size) / SAMPLE_RATE_HZ
        hum = (
            np.sin(2 * np.pi * 60 * time_axis)
            + 0.45 * np.sin(2 * np.pi * 120 * time_axis)
            + 0.2 * np.sin(2 * np.pi * 180 * time_axis)
        ).astype(np.float32)
        result = _mix_at_snr(signal, hum, 12.0)
    elif name == "strong_hiss":
        result = _mix_at_snr(signal, _white_noise(signal.size, rng), 10.0)
    elif name == "clipped_mic":
        result = np.clip(signal * 3.5, -0.34, 0.34) / 0.34 * 0.82
    elif name == "packet_dropouts":
        result = signal.copy()
        width = round(0.045 * SAMPLE_RATE_HZ)
        for _ in range(7):
            if result.size <= width:
                break
            start = int(rng.integers(0, result.size - width))
            result[start : start + width] = 0
    elif name == "phone_band":
        result = _phone_band(signal)
    elif name == "fast_pitch":
        result = _resample_pitch(signal, 1.18)
    elif name == "slow_pitch":
        result = _resample_pitch(signal, 0.84)
    else:
        raise AssertionError("augmentation dispatch is incomplete")

    return _finalize(result)


def pcm16_bytes(signal: np.ndarray) -> bytes:
    pcm = np.round(np.clip(signal, -1.0, 1.0) * 32767).astype("<i2")
    return pcm.tobytes()
