# Recognition Options

> **Status — Option 1 chosen and measured; the rest remain candidates
> (reviewed 2026-07-30).**
>
> - **Option 1 (lightweight local ASR)** is the active lane. Experiment 006 ran
>   30 real recordings through native Vosk `small-ja-0.22` on the M3: every
>   transcript picked its intended sentence out of ten, closed-catalog
>   precision `1.0` and recall `0.933`, median recognition about `0.2×` audio
>   duration, `~201 MiB` RSS after model load. But only `1/30` transcripts
>   matched the target exactly, so it is a coarse content check, not a
>   pronunciation judge.
> - A **browser** implementation exists on the unmerged branch
>   `recognition/vosk-local-first` — `vosk-browser` 0.0.8 with AudioWorklet
>   capture, a checksum-pinned 49.7 MB model archive, and closed-catalog
>   matching at a descriptive `0.30` threshold. One live microphone test has
>   passed. Browser and Android memory are still unmeasured, and that gates
>   more than archive size does.
> - `poc/` main still runs Chrome `SpeechRecognition` at a `0.56` similarity
>   threshold, with Levenshtein-backtrace kana hit/miss marks. Those marks are
>   string alignment, not acoustic evidence, and must stay replaceable.
> - **Options 2–4** (ONNX, standalone acoustic alignment, a target-conditioned
>   model) are untried. Do not promote synthetic DTW into the product gate
>   before the browser and human-labeled evidence is stronger.
> - The evaluation requirements at the end of this document are **unmet**.
>   There are no human acceptance labels yet, so no threshold here is
>   calibrated.
>
> Canonical detail, including the evidence sequence for resuming this lane:
> [`../memory/cells/recognition.md`](../memory/cells/recognition.md) and
> [`../memory/cells/experiments.md`](../memory/cells/experiments.md).

## Objective

The recognition system does not need to transcribe arbitrary Japanese speech. Each exercise already provides the expected sentence and reading.

The primary questions are:

1. Was the expected sentence spoken?
2. Was it complete and in the correct order?
3. Which regions probably differ from the target?
4. Is the attempt good enough to count as one successful repetition?

This narrower task should be used to reduce model size and operating cost.

## Option 1: Lightweight local ASR

A small Japanese recognizer can run locally in Chrome through WebAssembly.

A model such as the small Japanese Vosk package is a candidate for early evaluation because its download is relatively small compared with modern end-to-end speech models.

Possible outputs:

- decoded text
- word or token confidence
- approximate timestamps
- missing or substituted regions

Advantages:

- entirely client-side
- no per-attempt API charge
- offline operation after download
- simple sentence-level verification

Limitations:

- lower accuracy than large hosted models
- confidence may not correspond to pronunciation quality
- localized phonetic feedback may be weak
- memory usage must be measured on Android and iOS

The recognizer should be constrained by the known sentence wherever the runtime permits it.

## Option 2: Local ONNX Japanese model

A Japanese CTC or transducer model can be exported to ONNX and run through ONNX Runtime Web.

Advantages:

- one model format for browser and possible native runtimes
- access to logits or token probabilities
- greater control over alignment and scoring
- possible WebGPU acceleration

Limitations:

- potentially large model download
- longer initialization
- higher memory use
- model conversion may require custom operators or architecture changes
- WebGPU availability is not universal

A heavier model may be offered as an optional enhanced recognition package rather than the default download.

## Option 3: Direct acoustic alignment

The learner recording can be compared with the reference recording using acoustic features and dynamic time warping.

Candidate features:

- MFCC
- log-mel spectrogram
- energy contour
- pitch contour
- embeddings from a compact speech encoder

Advantages:

- computationally inexpensive
- no language model required
- naturally provides an alignment path for visualization
- useful for timing, missing regions, pauses, long vowels, and rhythm

Limitations:

- sensitive to differences between the reference voice and learner
- cannot reliably identify every phonetic error
- TTS artifacts may distort the target
- should not be presented as exact phoneme diagnosis

This is best used as one signal alongside recognition.

## Option 4: Custom target-conditioned model

A later model can be designed specifically for known-sentence pronunciation assessment.

Possible structure:

```text
16 kHz audio
→ compact Japanese speech encoder
→ kana or phoneme probabilities
→ constrained alignment with expected reading
→ per-unit pronunciation and timing scores
```

Potential advantages:

- smaller than unrestricted ASR
- better mora-level localization
- scoring designed for the product rather than adapted from transcription
- shared deployment through ONNX

Main limitation:

- high-quality pronunciation scoring requires non-native learner data and human evaluation

A model trained mainly on native Japanese speech may be poorly calibrated for learners.

## Candidate initial combination

The current candidate for a free browser MVP is:

```text
small local Japanese recognizer
+ expected-sentence matching
+ MFCC or log-mel feature extraction
+ dynamic time warping
+ conservative pass thresholds
```

The recognizer provides evidence that the sentence content is present. Acoustic alignment provides timing and regional feedback.

Neither signal should independently claim precise pronunciation diagnosis.

## Suggested scoring signals

### Content completeness

Measures whether expected units appear in sequence.

### Recognition margin

Compares confidence for the expected token with likely alternatives or deletion.

### Duration difference

Compares aligned mora or region duration with an acceptable range.

### Pause placement

Identifies unexpected silence inside words or phrases.

### Acoustic distance

Measures normalized difference between aligned feature regions.

### Recording quality

Separately detects:

- clipping
- low volume
- excessive noise
- truncated recording
- no speech

Poor recording quality should produce a retry request rather than a pronunciation failure.

## Feedback granularity

Possible UI units are:

- word
- kana character
- mora
- phoneme

Mora-level feedback is desirable for Japanese, but it should only be exposed when the alignment is sufficiently reliable. Word or phrase-region highlighting is safer for an early recognizer.

## Pass/fail policy

The model should provide evidence; product policy should determine whether an attempt counts.

A beginner-oriented policy may require:

- high completeness
- no major sequence error
- no missing word or phrase
- acceptable timing for critical distinctions
- forgiving acoustic-distance thresholds

Pitch accent should initially be informative rather than a hard gate.

## Evaluation requirements

Before selecting a model, test with:

- native Japanese speakers
- beginner learners
- intermediate learners
- different genders and voice ranges
- built-in laptop microphones
- Android phone microphones
- quiet and moderately noisy rooms
- slow and natural speaking rates

Important measurements include:

- model download size
- peak memory
- initialization time
- evaluation latency
- battery and thermal impact
- false acceptance of incorrect attempts
- false rejection of understandable attempts
- stability of localized feedback

The most important product metric is not general ASR character error rate. It is whether the system gives useful and consistent decisions for repeated learner attempts.
