import type { KaldiRecognizer, Model } from "vosk-browser";
import {
  recordingQualityProblem,
  summarizeRecordingQuality,
  type RecordingEvidence,
  type RecordingQuality,
  type RecordingQualityProblem,
} from "./quality";
import {
  openSelectedMicrophone,
  type MicrophoneRouteEvidence,
  type MicrophoneSelection,
} from "./microphone";

export const LOCAL_MODEL = {
  name: "vosk-model-small-ja-0.22",
  url: "/models/vosk-model-small-ja-0.22.tar.gz",
} as const;

const FINAL_RESULT_TIMEOUT_MS = 5_000;

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

function qualityError(problem: RecordingQualityProblem) {
  return new LocalRecognitionError(
    problem,
    `Recording quality check failed: ${problem}`,
  );
}

export class LocalRecognitionSession {
  private cancelled = false;
  private captureStopped = false;
  private finishPromise: Promise<LocalRecognitionResult> | null = null;
  private finalResultResolve: (() => void) | null = null;
  private flushResolve: (() => void) | null = null;
  private readonly resultParts: string[] = [];
  private readonly words: LocalRecognitionResult["words"] = [];
  private readonly evidence: RecordingEvidence;

  constructor(
    private readonly audioContext: AudioContext,
    private readonly captureNode: AudioWorkletNode,
    private readonly microphone: MediaStream,
    private readonly recognizer: KaldiRecognizer,
    private readonly sourceNode: MediaStreamAudioSourceNode,
    private readonly muteNode: GainNode,
    public readonly microphoneRoute: MicrophoneRouteEvidence,
    onPartial: (partial: string) => void,
    private readonly onMicrophoneRouteLost: () => void,
  ) {
    this.evidence = {
      clippedSamples: 0,
      peak: 0,
      sampleRate: audioContext.sampleRate,
      sumSquares: 0,
      totalSamples: 0,
    };

    this.captureNode.port.onmessage = (
      event: MessageEvent<CaptureMessage>,
    ) => {
      if (event.data.type === "flushed") {
        this.flushResolve?.();
        this.flushResolve = null;
        return;
      }

      const samples = event.data.samples;
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

    const microphoneTrack = this.microphone.getAudioTracks()[0];
    microphoneTrack.addEventListener("mute", this.handleMicrophoneRouteLost);
    microphoneTrack.addEventListener("ended", this.handleMicrophoneRouteLost);
  }

  private readonly handleMicrophoneRouteLost = () => {
    if (!this.captureStopped && !this.cancelled) {
      this.onMicrophoneRouteLost();
    }
  };

  private stopCapture() {
    if (this.captureStopped) return;
    this.captureStopped = true;
    const microphoneTrack = this.microphone.getAudioTracks()[0];
    microphoneTrack.removeEventListener(
      "mute",
      this.handleMicrophoneRouteLost,
    );
    microphoneTrack.removeEventListener(
      "ended",
      this.handleMicrophoneRouteLost,
    );
    for (const track of this.microphone.getTracks()) track.stop();
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
    await this.audioContext.close();
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
    if (this.audioContext.state !== "closed") {
      await this.audioContext.close();
    }
  }
}

export async function startLocalRecognition(
  onPartial: (partial: string) => void,
  microphoneSelection: MicrophoneSelection,
  onMicrophoneRouteLost: () => void,
) {
  const model = await prepareLocalRecognizer();
  const { evidence, microphone } = await openSelectedMicrophone(
    microphoneSelection,
  );

  const audioContext = new AudioContext({ latencyHint: "interactive" });
  let recognizer: KaldiRecognizer | null = null;

  try {
    await audioContext.audioWorklet.addModule(
      "/recognition-capture-worklet.js",
    );
    await audioContext.resume();

    recognizer = new model.KaldiRecognizer(audioContext.sampleRate);
    recognizer.setWords(true);

    const sourceNode = audioContext.createMediaStreamSource(microphone);
    const captureNode = new AudioWorkletNode(
      audioContext,
      "local-voice-capture",
    );
    const muteNode = audioContext.createGain();
    muteNode.gain.value = 0;

    sourceNode.connect(captureNode);
    captureNode.connect(muteNode);
    muteNode.connect(audioContext.destination);

    return new LocalRecognitionSession(
      audioContext,
      captureNode,
      microphone,
      recognizer,
      sourceNode,
      muteNode,
      evidence,
      onPartial,
      onMicrophoneRouteLost,
    );
  } catch (error) {
    for (const track of microphone.getTracks()) track.stop();
    recognizer?.remove();
    await audioContext.close();
    throw error;
  }
}
