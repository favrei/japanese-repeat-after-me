import type { KaldiRecognizer, Model } from "vosk-browser";
import {
  recordingQualityProblem,
  summarizeRecordingQuality,
  type RecordingEvidence,
  type RecordingQuality,
  type RecordingQualityProblem,
} from "./quality";
import {
  MicrophoneRouteError,
  type GameMicrophoneSession,
  type MicrophoneRouteEvidence,
} from "./microphone";

export const LOCAL_MODEL = {
  name: "vosk-model-small-ja-0.22",
  url: "/models/vosk-model-small-ja-0.22.tar.gz",
} as const;

const FINAL_RESULT_TIMEOUT_MS = 5_000;

/**
 * Ceiling on waiting for the capture graph to deliver real audio.
 *
 * The gate below prefers the true signal — the first buffer that is not
 * digital silence — and falls back to this only so a device that never
 * produces one cannot stall the turn forever.
 */
const CAPTURE_START_TIMEOUT_MS = 1_200;

/** How often the output route is sampled while waiting for it to hold still. */
const OUTPUT_SAMPLE_INTERVAL_MS = 100;
/** Consecutive quiet samples that count as a settled output route. */
const OUTPUT_STABLE_SAMPLES = 3;
/** Ceiling on waiting for the output device; never the primary signal. */
const OUTPUT_SETTLE_TIMEOUT_MS = 4_000;

type VoskResultMessage = {
  event: "result";
  result: {
    result?: Array<{
      conf: number;
      end: number;
      start: number;
      word: string;
    }>;
    text: string;
  };
};

type VoskPartialMessage = {
  event: "partialresult";
  result: {
    partial: string;
  };
};

type VoskErrorMessage = {
  error: string;
  event: "error";
};

type CaptureMessage =
  | { samples: Float32Array; type: "samples" }
  | { type: "flushed" };

export type LocalRecognitionResult = {
  quality: RecordingQuality;
  transcript: string;
  words: Array<{
    confidence: number;
    end: number;
    start: number;
    word: string;
  }>;
};

export class LocalRecognitionError extends Error {
  constructor(
    public readonly code:
      | "empty-transcript"
      | "model-unavailable"
      | RecordingQualityProblem,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "LocalRecognitionError";
  }
}

let modelPromise: Promise<Model> | null = null;

async function importVoskBrowser() {
  if (
    (import.meta as ImportMeta & { env: { SSR: boolean } }).env.SSR
  ) {
    throw new Error("The local recognizer is browser-only");
  }
  return import("vosk-browser");
}

async function waitForProductionModelTransport() {
  if (
    process.env.NODE_ENV !== "production" ||
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  await navigator.serviceWorker.ready;
  if (navigator.serviceWorker.controller) return;

  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error("Service worker did not take control"));
    }, 5_000);
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => {
        window.clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
  });
}

export function prepareLocalRecognizer() {
  if (!modelPromise) {
    modelPromise = waitForProductionModelTransport()
      .then(importVoskBrowser)
      .then(({ createModel }) => createModel(LOCAL_MODEL.url, -1))
      .catch((error) => {
        modelPromise = null;
        throw new LocalRecognitionError(
          "model-unavailable",
          `Could not load ${LOCAL_MODEL.name}`,
          { cause: error },
        );
      });
  }

  return modelPromise;
}

let audioContextPromise: Promise<AudioContext> | null = null;

/**
 * One AudioContext for the whole game session.
 *
 * Building a context, fetching the capture worklet, and resuming it cost real
 * time on every turn when this was per-recognition. Holding one open also
 * keeps the output device attached, so the speaker or headset does not have to
 * spin up again before each played line.
 */
function openRecognitionAudio() {
  if (!audioContextPromise) {
    audioContextPromise = (async () => {
      const context = new AudioContext({ latencyHint: "interactive" });
      await context.audioWorklet.addModule("/recognition-capture-worklet.js");

      // Silent, always-on render keeps the output route warm for playback.
      const keepAlive = context.createConstantSource();
      const silence = context.createGain();
      silence.gain.value = 0;
      keepAlive.connect(silence);
      silence.connect(context.destination);
      keepAlive.start();

      return context;
    })().catch((error) => {
      audioContextPromise = null;
      throw error;
    });
  }

  return audioContextPromise;
}

/** Pay the context and worklet setup once, before the first recording. */
export async function prewarmRecognitionAudio() {
  const context = await openRecognitionAudio();
  if (context.state === "suspended") await context.resume();
  return context;
}

/**
 * Resolves once the output device is genuinely playing, or `false` when it
 * never settles.
 *
 * Two real status signals, no counting:
 *
 * - `currentTime` advances only while the device is actually rendering audio.
 *   A headset switching between its music and headset profiles stalls it.
 * - `outputLatency` is the device's own reported latency, so it changes the
 *   moment the route underneath the context changes.
 *
 * Both have to hold still several samples in a row; the timeout is only a
 * ceiling so a device that never reports steady cannot block the story.
 */
export async function settleRecognitionOutput(
  timeoutMs = OUTPUT_SETTLE_TIMEOUT_MS,
) {
  const context = await openRecognitionAudio();
  if (context.state === "suspended") await context.resume();

  const deadline = performance.now() + timeoutMs;
  let previousTime = context.currentTime;
  let previousLatency = context.outputLatency;
  let stableSamples = 0;

  while (performance.now() < deadline) {
    await new Promise((resolve) =>
      window.setTimeout(resolve, OUTPUT_SAMPLE_INTERVAL_MS),
    );

    const time = context.currentTime;
    const latency = context.outputLatency;
    const rendering = context.state === "running" && time > previousTime;
    const routeHeld = Math.abs(latency - previousLatency) < 1e-6;

    stableSamples = rendering && routeHeld ? stableSamples + 1 : 0;
    previousTime = time;
    previousLatency = latency;

    if (stableSamples >= OUTPUT_STABLE_SAMPLES) return true;
  }

  return false;
}

/** Drop the shared graph when the game session ends. */
export async function releaseRecognitionAudio() {
  const pending = audioContextPromise;
  audioContextPromise = null;
  if (!pending) return;
  const context = await pending.catch(() => null);
  if (context && context.state !== "closed") await context.close();
}

function qualityError(problem: RecordingQualityProblem) {
  return new LocalRecognitionError(
    problem,
    `Recording quality check failed: ${problem}`,
  );
}

export class LocalRecognitionSession {
  private cancelled = false;
  private capturing = false;
  private captureStopped = false;
  private captureStartTimer: number | null = null;
  private finishPromise: Promise<LocalRecognitionResult> | null = null;
  private finalResultResolve: (() => void) | null = null;
  private flushResolve: (() => void) | null = null;
  private readonly resultParts: string[] = [];
  private readonly words: LocalRecognitionResult["words"] = [];
  private readonly evidence: RecordingEvidence;
  public readonly microphoneRoute: MicrophoneRouteEvidence;

  constructor(
    private readonly audioContext: AudioContext,
    private readonly captureNode: AudioWorkletNode,
    private readonly recognizer: KaldiRecognizer,
    private readonly sourceNode: MediaStreamAudioSourceNode,
    private readonly muteNode: GainNode,
    private readonly gameMicrophone: GameMicrophoneSession,
    private readonly onCaptureStart: () => void,
    onPartial: (partial: string) => void,
  ) {
    this.microphoneRoute = gameMicrophone.route;
    this.evidence = {
      clippedSamples: 0,
      peak: 0,
      sampleRate: audioContext.sampleRate,
      sumSquares: 0,
      totalSamples: 0,
    };

    this.captureStartTimer = window.setTimeout(() => {
      this.captureStartTimer = null;
      this.beginCapture();
    }, CAPTURE_START_TIMEOUT_MS);

    this.captureNode.port.onmessage = (
      event: MessageEvent<CaptureMessage>,
    ) => {
      if (event.data.type === "flushed") {
        this.flushResolve?.();
        this.flushResolve = null;
        return;
      }
      if (this.captureStopped) return;

      const samples = event.data.samples;
      if (!this.capturing) {
        // A microphone that has not finished opening feeds through digital
        // silence. Real audio — even a quiet room's noise floor — is the
        // signal that the whole route is live, so recording starts there and
        // the warm-up frames are dropped rather than scored.
        if (!this.gameMicrophone.ready || !samples.some((sample) => sample !== 0)) {
          return;
        }
        this.beginCapture();
      }

      for (const sample of samples) {
        const absolute = Math.abs(sample);
        this.evidence.peak = Math.max(this.evidence.peak, absolute);
        this.evidence.sumSquares += sample * sample;
        this.evidence.totalSamples += 1;
        if (absolute >= 0.99) this.evidence.clippedSamples += 1;
      }

      this.recognizer.acceptWaveformFloat(
        samples,
        this.audioContext.sampleRate,
      );
    };

    this.recognizer.on("partialresult", (message) => {
      onPartial((message as VoskPartialMessage).result.partial);
    });
    this.recognizer.on("result", (message) => {
      const result = (message as VoskResultMessage).result;
      if (result.text.trim()) this.resultParts.push(result.text.trim());
      for (const word of result.result ?? []) {
        this.words.push({
          confidence: word.conf,
          end: word.end,
          start: word.start,
          word: word.word,
        });
      }
      this.finalResultResolve?.();
      this.finalResultResolve = null;
    });
    this.recognizer.on("error", (message) => {
      const error = (message as VoskErrorMessage).error;
      console.error("Local Vosk recognizer error", error);
    });

  }

  private beginCapture() {
    if (this.capturing || this.captureStopped || this.cancelled) return;
    this.capturing = true;
    this.clearCaptureStartTimer();
    this.onCaptureStart();
  }

  private clearCaptureStartTimer() {
    if (this.captureStartTimer === null) return;
    window.clearTimeout(this.captureStartTimer);
    this.captureStartTimer = null;
  }

  private stopCapture() {
    if (this.captureStopped) return;
    this.captureStopped = true;
    this.clearCaptureStartTimer();
    this.sourceNode.disconnect();
    this.captureNode.disconnect();
    this.muteNode.disconnect();
  }

  private async flushCapture() {
    await new Promise<void>((resolve) => {
      const timeout = window.setTimeout(resolve, 250);
      this.flushResolve = () => {
        window.clearTimeout(timeout);
        resolve();
      };
      this.captureNode.port.postMessage({ type: "flush" });
    });
  }

  private async retrieveFinalResult() {
    await new Promise<void>((resolve) => {
      const timeout = window.setTimeout(
        resolve,
        FINAL_RESULT_TIMEOUT_MS,
      );
      this.finalResultResolve = () => {
        window.clearTimeout(timeout);
        resolve();
      };
      this.recognizer.retrieveFinalResult();
    });
  }

  finish() {
    if (!this.finishPromise) {
      this.finishPromise = this.finishOnce();
    }
    return this.finishPromise;
  }

  private async finishOnce(): Promise<LocalRecognitionResult> {
    if (this.cancelled) {
      throw new Error("Recognition session was cancelled");
    }

    await this.flushCapture();
    this.stopCapture();
    await this.retrieveFinalResult();
    this.recognizer.remove();

    const quality = summarizeRecordingQuality(this.evidence);
    const problem = recordingQualityProblem(quality);
    if (problem) throw qualityError(problem);

    const transcript = this.resultParts.join(" ").trim();
    if (!transcript) {
      throw new LocalRecognitionError(
        "empty-transcript",
        "The local recognizer did not return speech",
      );
    }

    return {
      quality,
      transcript,
      words: [...this.words],
    };
  }

  async cancel() {
    if (this.cancelled) return;
    this.cancelled = true;
    this.stopCapture();
    this.recognizer.remove();
  }
}

export async function startLocalRecognition(
  onPartial: (partial: string) => void,
  gameMicrophone: GameMicrophoneSession,
  onCaptureStart: () => void = () => undefined,
) {
  const model = await prepareLocalRecognizer();

  if (!gameMicrophone.active) {
    throw new MicrophoneRouteError(
      "route-mismatch",
      "The selected microphone session is no longer active",
    );
  }

  // Ask the device itself whether it can deliver audio yet instead of assuming
  // it can. A `false` here is not fatal: the capture gate still waits for real
  // samples, and this only avoids building the graph against a dead source.
  await gameMicrophone.waitUntilReady();
  if (!gameMicrophone.active) {
    throw new MicrophoneRouteError(
      "route-mismatch",
      "The selected microphone session is no longer active",
    );
  }

  const audioContext = await prewarmRecognitionAudio();
  let recognizer: KaldiRecognizer | null = null;
  let sourceNode: MediaStreamAudioSourceNode | null = null;
  let captureNode: AudioWorkletNode | null = null;
  let muteNode: GainNode | null = null;

  try {
    recognizer = new model.KaldiRecognizer(audioContext.sampleRate);
    recognizer.setWords(true);

    sourceNode = audioContext.createMediaStreamSource(gameMicrophone.stream);
    captureNode = new AudioWorkletNode(audioContext, "local-voice-capture");
    muteNode = audioContext.createGain();
    muteNode.gain.value = 0;

    sourceNode.connect(captureNode);
    captureNode.connect(muteNode);
    muteNode.connect(audioContext.destination);

    return new LocalRecognitionSession(
      audioContext,
      captureNode,
      recognizer,
      sourceNode,
      muteNode,
      gameMicrophone,
      onCaptureStart,
      onPartial,
    );
  } catch (error) {
    recognizer?.remove();
    // The context outlives the turn now, so a half-built graph has to be torn
    // down here rather than disappearing with a closed context.
    sourceNode?.disconnect();
    captureNode?.disconnect();
    muteNode?.disconnect();
    throw error;
  }
}
