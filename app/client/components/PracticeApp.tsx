"use client";

/* eslint-disable @next/next/no-img-element -- art-pack paths are runtime manifest data */
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArtReview } from "./ArtReview";
import {
  getArtPack,
  getCharacter,
  getScene,
  isArtPackId,
  type ArtCharacter,
  type ArtPackId,
  type ArtScene,
  type CharacterMood,
} from "../content/art-packs";
import {
  advanceTarget,
  DEFAULT_INTERLUDE_HOLD_MS,
  openingTarget,
  resolveBubbleEvent,
} from "../gameplay/flow";
import {
  LocalRecognitionError,
  prepareLocalRecognizer,
  startLocalRecognition,
  type LocalRecognitionSession,
} from "../recognition/localVosk";
import {
  chooseRememberedMicrophone,
  discoverMicrophones,
  openGameMicrophone,
  type GameMicrophoneSession,
  MicrophoneRouteError,
  SAVED_MICROPHONE_KEY,
  type MicrophoneInput,
  type MicrophoneRouteEvidence,
  type MicrophoneSelection,
} from "../recognition/microphone";
import {
  markReadingHits,
  normalizeJapanese,
  scoreAttempt,
  type ReadingMark,
} from "../gameplay/scoring";
import {
  getStory,
  STORIES,
  type Story,
  type StoryId,
} from "../content/stories";
import type { FlowBubble, PracticeStage } from "../../shared/story";

type Screen = "menu" | "conversation" | "complete";
type FeedbackTone = "success" | "failure" | "notice";
type RecognitionState = "error" | "idle" | "loading" | "ready";
type MicrophoneState =
  | "choosing"
  | "error"
  | "idle"
  | "loading"
  | "route-lost"
  | "selected";

type Feedback = {
  tone: FeedbackTone;
  kind: "attempt" | "error";
  detail: string;
  transcript?: string;
};

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const SUCCESS_ADVANCE_HOLD_MS = 500;

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

/** Development-only: a deliberately below-threshold version of the line. */
function nearMissTranscript(reading: string) {
  return Array.from(normalizeJapanese(reading))
    .map((char, index) => (index % 5 === 0 ? char : "ま"))
    .join("");
}

function playSystemJapanese(text: string) {
  return new Promise<void>((resolve) => {
    if (!("speechSynthesis" in window)) {
      setTimeout(resolve, 650);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const japaneseVoices = voices.filter((voice) =>
      voice.lang.toLowerCase().startsWith("ja"),
    );
    utterance.lang = "ja-JP";
    utterance.rate = 0.95;
    utterance.voice =
      japaneseVoices.find((voice) =>
        /kyoko|otoya|google.*日本語/i.test(voice.name),
      ) ??
      japaneseVoices[0] ??
      null;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

function playJapanese(
  text: string,
  audioSrc: string | undefined,
  setActiveAudio: (audio: HTMLAudioElement | null) => void,
) {
  if (!audioSrc) return playSystemJapanese(text);

  return new Promise<void>((resolve) => {
    const audio = new Audio(audioSrc);
    let finished = false;
    let fallbackStarted = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      setActiveAudio(null);
      resolve();
    };

    const fallback = () => {
      if (fallbackStarted || finished) return;
      fallbackStarted = true;
      setActiveAudio(null);
      void playSystemJapanese(text).then(finish);
    };

    audio.preload = "auto";
    audio.onended = finish;
    audio.onerror = fallback;
    setActiveAudio(audio);
    void audio.play().catch(fallback);
  });
}

/**
 * Keyed on the scene id by its caller, so React remounts it on a scene change
 * and the new background fades in instead of snapping.
 */
function SceneBackground({ scene }: { scene: ArtScene }) {
  const zoom = (focus: string) =>
    ({
      objectPosition: focus,
      transformOrigin: focus,
      transform: scene.scale ? `scale(${scene.scale})` : undefined,
    }) as CSSProperties;

  return (
    <div className="scene-background" aria-hidden="true">
      <img
        className="scene-image scene-landscape"
        src={scene.landscape}
        style={zoom(scene.focus.landscape)}
        alt=""
      />
      <img
        className="scene-image scene-portrait"
        src={scene.portrait}
        style={zoom(scene.focus.portrait)}
        alt=""
      />
    </div>
  );
}

function OtherPartyCharacter({
  mood,
  dim,
  character,
}: {
  mood: CharacterMood;
  dim: boolean;
  character: ArtCharacter;
}) {
  return (
    <img
      className={`character-art${dim ? " dim" : ""}`}
      src={character.art[mood]}
      alt=""
      aria-hidden="true"
    />
  );
}

/** The narrator's card: the break that carries a scene, cast, or time change. */
function TransitionCard({ stage }: { stage: PracticeStage }) {
  return (
    <article
      className="interlude-card"
      data-testid={`transition-${stage.transition.id}`}
    >
      <p className="interlude-kicker">第{stage.number}話</p>
      <h2 className="interlude-title">{stage.jpTitle}</h2>
      <div className="interlude-rule" aria-hidden="true" />
      <p className="interlude-jp">{stage.transition.japanese}</p>
      <p className="interlude-reading">{stage.transition.reading}</p>
      <p className="interlude-translation">{stage.transition.translation}</p>
    </article>
  );
}

function DialogueBalloon({
  bubble,
  showStatus,
  marks,
  character,
}: {
  bubble: FlowBubble;
  showStatus: boolean;
  marks?: ReadingMark[];
  character: ArtCharacter;
}) {
  const isLearner = bubble.speaker === "learner";
  const tailSide = isLearner ? "right" : character.anchor;

  return (
    <article
      className={`balloon speaker-${bubble.speaker} tail-${tailSide}`}
      data-testid={`bubble-${bubble.id}`}
    >
      <span className={`speaker-label${isLearner ? " learner" : ""}`}>
        {isLearner ? "あなた" : character.label}
      </span>
      {bubble.mode === "autoplay" && showStatus ? (
        <span className="autoplay-label">AUTO</span>
      ) : null}
      <p className="dialogue-jp">{bubble.japanese}</p>
      {marks ? (
        <p className="dialogue-reading marked">
          {marks.map((mark, index) => (
            <span className={mark.state} key={`${mark.char}-${index}`}>
              {mark.char}
            </span>
          ))}
        </p>
      ) : (
        <p className="dialogue-reading">{bubble.reading}</p>
      )}
      <p className="dialogue-translation">{bubble.translation}</p>
    </article>
  );
}

function MicMark() {
  return <span className="mic-mark" aria-hidden="true" />;
}

export function PracticeApp() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [selectedStoryId, setSelectedStoryId] = useState<StoryId>(
    STORIES[0].id,
  );
  const [sessionStartPosition, setSessionStartPosition] = useState(0);
  const [startingStageIndex, setStartingStageIndex] = useState(0);
  const [position, setPosition] = useState(0);
  /** Stage index whose transition card is holding the story, or null while it plays. */
  const [interludeStage, setInterludeStage] = useState<number | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState("");
  const [recognitionState, setRecognitionState] =
    useState<RecognitionState>("idle");
  const [microphoneState, setMicrophoneState] =
    useState<MicrophoneState>("idle");
  const [microphoneInputs, setMicrophoneInputs] = useState<
    MicrophoneInput[]
  >([]);
  const [microphoneSelection, setMicrophoneSelection] =
    useState<MicrophoneSelection | null>(null);
  const [microphoneRoute, setMicrophoneRoute] =
    useState<MicrophoneRouteEvidence | null>(null);
  const [playbackReplayToken, setPlaybackReplayToken] = useState(0);
  const [qaMode, setQaMode] = useState(false);
  const [artReviewPackId, setArtReviewPackId] = useState<ArtPackId | null>(
    null,
  );
  const [installPrompt, setInstallPrompt] =
    useState<InstallPromptEvent | null>(null);

  const recognitionRef = useRef<LocalRecognitionSession | null>(null);
  const gameMicrophoneRef = useRef<GameMicrophoneSession | null>(null);
  const gameSessionRunRef = useRef(0);
  const microphoneOpenRunRef = useRef(0);
  const recognitionRunRef = useRef(0);
  const recordingTimerRef = useRef<number | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const playbackRunRef = useRef(0);

  const selectedStory = getStory(selectedStoryId);
  const stages = selectedStory.stages;
  const flow = useMemo(
    () => selectedStory.flow.slice(sessionStartPosition),
    [selectedStory, sessionStartPosition],
  );
  const speakingBubbles = useMemo(
    () => selectedStory.flow.filter((bubble) => bubble.mode === "speak"),
    [selectedStory],
  );
  const artPack = getArtPack(selectedStory.artPackId);
  const currentBubble = flow[position];

  useEffect(() => {
    if (window.location.hostname === "0.0.0.0") {
      const trustedLocalUrl = new URL(window.location.href);
      trustedLocalUrl.hostname = "localhost";
      window.location.replace(trustedLocalUrl);
      return;
    }

    const qaTimer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const isDevelopment = process.env.NODE_ENV !== "production";
      setQaMode(isDevelopment && params.get("qa") === "1");
      const artParam = params.get("art");
      setArtReviewPackId(
        isDevelopment && artParam
          ? artParam === "1"
            ? "cafe"
            : isArtPackId(artParam)
              ? artParam
              : null
          : null,
      );
    }, 0);

    const handleInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handleInstall);

    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    return () => {
      window.clearTimeout(qaTimer);
      window.removeEventListener("beforeinstallprompt", handleInstall);
    };
  }, []);

  const cancelActiveMedia = useCallback(() => {
    playbackRunRef.current += 1;
    recognitionRunRef.current += 1;
    void recognitionRef.current?.cancel();
    recognitionRef.current = null;
    activeAudioRef.current?.pause();
    activeAudioRef.current = null;
    window.speechSynthesis?.cancel();
    setIsListening(false);
    setIsEvaluating(false);
    setPartialTranscript("");
    setIsSpeaking(false);
    if (recordingTimerRef.current !== null) {
      window.clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  const closeGameMicrophone = useCallback(() => {
    microphoneOpenRunRef.current += 1;
    gameMicrophoneRef.current?.close();
    gameMicrophoneRef.current = null;
  }, []);

  const reportMicrophoneRouteLost = useCallback(() => {
    const session = recognitionRef.current;
    gameSessionRunRef.current += 1;
    recognitionRunRef.current += 1;
    recognitionRef.current = null;
    void session?.cancel();
    closeGameMicrophone();
    setIsListening(false);
    setIsEvaluating(false);
    setPartialTranscript("");
    setMicrophoneInputs([]);
    setMicrophoneSelection(null);
    setMicrophoneRoute(null);
    setMicrophoneState("route-lost");
    setFeedback({
      tone: "failure",
      kind: "error",
      detail:
        "マイクの せつぞくが かわりました — recording stopped; reconnect and confirm the headset before trying again.",
    });
  }, [closeGameMicrophone]);

  useEffect(() => {
    if (
      screen !== "conversation" ||
      !microphoneSelection ||
      !navigator.mediaDevices?.enumerateDevices
    ) {
      return;
    }

    const handleDeviceChange = () => {
      if (microphoneSelection.deviceId === "default") {
        reportMicrophoneRouteLost();
        return;
      }

      void navigator.mediaDevices.enumerateDevices().then((devices) => {
        const selectedInputStillExists = devices.some(
          (device) =>
            device.kind === "audioinput" &&
            device.deviceId === microphoneSelection.deviceId,
        );
        if (!selectedInputStillExists) reportMicrophoneRouteLost();
      });
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange,
      );
    };
  }, [microphoneSelection, reportMicrophoneRouteLost, screen]);

  const advanceBubble = useCallback(() => {
    cancelActiveMedia();
    setFailedAttempts(0);
    setFeedback(null);
    setIsAdvancing(false);

    const target = advanceTarget(flow, position);
    if (target.kind === "complete") {
      gameSessionRunRef.current += 1;
      closeGameMicrophone();
      setScreen("complete");
      return;
    }

    setPosition(target.position);
    // A stage boundary breaks for the narrator before the next bubble speaks.
    setInterludeStage(target.kind === "interlude" ? target.stageIndex : null);
  }, [cancelActiveMedia, closeGameMicrophone, flow, position]);

  const releaseInterlude = useCallback(() => {
    cancelActiveMedia();
    setInterludeStage(null);
  }, [cancelActiveMedia]);

  useEffect(() => {
    if (screen !== "conversation" || interludeStage === null) return;

    const transition = stages[interludeStage].transition;
    const runId = playbackRunRef.current + 1;
    playbackRunRef.current = runId;

    const hold = qaMode
      ? wait(60_000)
      : transition.audioSrc
        ? // Narration keeps the same treatment as dialogue when a clip exists;
          // without one it holds silently rather than reaching for a synthetic
          // voice the story has not cast.
          playJapanese(transition.japanese, transition.audioSrc, (audio) => {
            activeAudioRef.current = audio;
          })
        : wait(transition.holdMs ?? DEFAULT_INTERLUDE_HOLD_MS);

    hold.then(() => {
      if (playbackRunRef.current !== runId) return;
      setInterludeStage(null);
    });

    return () => {
      if (playbackRunRef.current === runId) {
        playbackRunRef.current += 1;
        activeAudioRef.current?.pause();
        activeAudioRef.current = null;
      }
    };
  }, [interludeStage, qaMode, screen, stages]);

  useEffect(() => {
    if (
      screen !== "conversation" ||
      interludeStage !== null ||
      !currentBubble ||
      currentBubble.mode !== "autoplay"
    ) {
      return;
    }

    const runId = playbackRunRef.current + 1;
    playbackRunRef.current = runId;
    const startTimer = window.setTimeout(() => {
      if (playbackRunRef.current !== runId) return;
      setIsSpeaking(true);
      setFeedback(null);

      const playback = qaMode
        ? wait(60_000)
        : playJapanese(
            currentBubble.japanese,
            currentBubble.audioSrc,
            (audio) => {
              activeAudioRef.current = audio;
            },
          );

      playback.then(async () => {
        await wait(220);
        if (playbackRunRef.current !== runId) return;
        advanceBubble();
      });
    }, 0);

    return () => {
      window.clearTimeout(startTimer);
      if (playbackRunRef.current === runId) {
        playbackRunRef.current += 1;
        activeAudioRef.current?.pause();
        activeAudioRef.current = null;
        window.speechSynthesis?.cancel();
      }
    };
  }, [
    advanceBubble,
    currentBubble,
    interludeStage,
    playbackReplayToken,
    qaMode,
    screen,
  ]);

  useEffect(() => {
    return () => {
      gameSessionRunRef.current += 1;
      cancelActiveMedia();
      closeGameMicrophone();
    };
  }, [cancelActiveMedia, closeGameMicrophone]);

  const prepareRecognition = useCallback(async () => {
    setRecognitionState("loading");
    try {
      await prepareLocalRecognizer();
      setRecognitionState("ready");
      return true;
    } catch {
      setRecognitionState("error");
      return false;
    }
  }, []);

  function beginStage(story: Story, stageIndex: number) {
    const startPosition = story.flow.findIndex(
      (bubble) => bubble.stageIndex === stageIndex,
    );
    if (startPosition < 0) return;

    cancelActiveMedia();
    closeGameMicrophone();
    const gameSessionRunId = gameSessionRunRef.current + 1;
    gameSessionRunRef.current = gameSessionRunId;
    const opening = openingTarget(stageIndex);
    setSelectedStoryId(story.id);
    setSessionStartPosition(startPosition);
    setStartingStageIndex(stageIndex);
    setPosition(opening.kind === "complete" ? 0 : opening.position);
    setInterludeStage(opening.kind === "interlude" ? opening.stageIndex : null);
    setFailedAttempts(0);
    setFeedback(null);
    setIsAdvancing(false);
    setScreen("conversation");
    if (window.isSecureContext && !qaMode) {
      void prepareRecognition();
      void configureMicrophone(gameSessionRunId);
    }
  }

  function exitConversation() {
    gameSessionRunRef.current += 1;
    cancelActiveMedia();
    closeGameMicrophone();
    setScreen("menu");
    setPosition(0);
    setInterludeStage(null);
    setFailedAttempts(0);
    setFeedback(null);
    setIsAdvancing(false);
  }

  async function activateGameMicrophone(
    selection: MicrophoneSelection,
    gameSessionRunId = gameSessionRunRef.current,
  ) {
    if (gameSessionRunRef.current !== gameSessionRunId) return null;

    const activeMicrophone = gameMicrophoneRef.current;
    if (
      activeMicrophone?.active &&
      activeMicrophone.selection.deviceId === selection.deviceId
    ) {
      setMicrophoneRoute(activeMicrophone.route);
      setMicrophoneState("selected");
      return activeMicrophone;
    }

    const openRunId = microphoneOpenRunRef.current + 1;
    microphoneOpenRunRef.current = openRunId;
    activeMicrophone?.close();
    gameMicrophoneRef.current = null;
    setMicrophoneState("loading");
    setMicrophoneRoute(null);

    try {
      const microphone = await openGameMicrophone(
        selection,
        reportMicrophoneRouteLost,
      );
      if (
        microphoneOpenRunRef.current !== openRunId ||
        gameSessionRunRef.current !== gameSessionRunId
      ) {
        microphone.close();
        return null;
      }

      gameMicrophoneRef.current = microphone;
      setMicrophoneRoute(microphone.route);
      setMicrophoneState("selected");
      return microphone;
    } catch (error) {
      if (microphoneOpenRunRef.current === openRunId) {
        recognitionProblem(error);
      }
      return null;
    }
  }

  function scheduleAdvance(delay = SUCCESS_ADVANCE_HOLD_MS) {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
    }
    setIsAdvancing(true);
    advanceTimerRef.current = window.setTimeout(() => {
      advanceTimerRef.current = null;
      advanceBubble();
    }, delay);
  }

  function replayCurrentAutoplay() {
    if (interludeStage !== null || currentBubble.mode !== "autoplay") return;
    setIsSpeaking(false);
    setFeedback(null);
    setPlaybackReplayToken((token) => token + 1);
  }

  function handleTranscripts(transcripts: string[]) {
    if (!currentBubble || currentBubble.mode !== "speak" || isAdvancing) return;

    const result = scoreAttempt(transcripts, currentBubble, speakingBubbles);
    const decision = resolveBubbleEvent(
      result.passed ? "success" : "failure",
      failedAttempts,
    );

    if (result.passed) {
      setFeedback({
        tone: "success",
        kind: "attempt",
        detail: "つぎの ふきだしへ すすみます — moving to the next bubble…",
        transcript: result.transcript,
      });
      window.navigator.vibrate?.(40);
      scheduleAdvance();
      return;
    }

    setFailedAttempts(decision.failedAttempts);
    if (decision.advance) {
      setFeedback({
        tone: "notice",
        kind: "attempt",
        detail: "3かい だめでも すすみます — the third miss still moves on.",
        transcript: result.transcript,
      });
      scheduleAdvance(650);
      return;
    }

    const remaining = 3 - decision.failedAttempts;
    setFeedback({
      tone: "failure",
      kind: "attempt",
      detail: `のこり ${remaining}かい — ${remaining} ${
        remaining === 1 ? "attempt" : "attempts"
      } remaining.`,
      transcript: result.transcript,
    });
  }

  function recognitionProblem(error: unknown) {
    const permissionDenied =
      error instanceof DOMException &&
      ["NotAllowedError", "PermissionDeniedError"].includes(error.name);
    const localCode =
      error instanceof LocalRecognitionError ? error.code : undefined;
    const microphoneCode =
      error instanceof MicrophoneRouteError ? error.code : undefined;

    if (localCode === "model-unavailable") {
      setRecognitionState("error");
    }
    if (microphoneCode) {
      setMicrophoneRoute(null);
      setMicrophoneState(
        microphoneCode === "route-mismatch" ? "route-lost" : "error",
      );
    }

    let detail =
      "ききとれませんでした — this technical error does not count as a failed attempt.";
    if (permissionDenied) {
      detail =
        "マイクの きょかが ひつようです — allow microphone access, then try again or use Skip.";
    } else if (localCode === "model-unavailable") {
      detail =
        "ローカルモデルを よみこめません — the Japanese model is unavailable. Retry the download or use Skip.";
    } else if (localCode === "too-short") {
      detail =
        "みじかすぎました — hold the button until the whole sentence is finished.";
    } else if (localCode === "too-quiet" || localCode === "no-audio") {
      detail =
        "こえが ちいさすぎました — move closer to the microphone and try again.";
    } else if (localCode === "clipped") {
      detail =
        "おとが おおきすぎました — move back from the microphone and try again.";
    } else if (localCode === "empty-transcript") {
      detail =
        "ことばを みつけられませんでした — no speech was recognized; please try again.";
    } else if (microphoneCode === "route-mismatch") {
      detail =
        "えらんだ マイクを つかえません — Chrome changed the input; confirm the headset before trying again.";
    } else if (microphoneCode === "no-input") {
      detail =
        "マイクが みつかりません — connect a headset or microphone, then check again.";
    }

    setFeedback({
      tone: "failure",
      kind: "error",
      detail,
    });
  }

  async function configureMicrophone(
    gameSessionRunId = gameSessionRunRef.current,
  ) {
    setMicrophoneState("loading");
    setMicrophoneRoute(null);

    try {
      const inputs = await discoverMicrophones();
      if (gameSessionRunRef.current !== gameSessionRunId) return null;
      const rememberedDeviceId = window.localStorage.getItem(
        SAVED_MICROPHONE_KEY,
      );
      const selection = chooseRememberedMicrophone(
        inputs,
        rememberedDeviceId,
      );

      setMicrophoneInputs(inputs);
      setMicrophoneSelection(selection);
      if (selection) {
        window.localStorage.setItem(
          SAVED_MICROPHONE_KEY,
          selection.deviceId,
        );
        const microphone = await activateGameMicrophone(
          selection,
          gameSessionRunId,
        );
        return microphone ? selection : null;
      }

      setMicrophoneState("choosing");
      setFeedback({
        tone: "notice",
        kind: "error",
        detail:
          "つかう マイクを えらんでください — choose the connected headset microphone, then press record again.",
      });
      return null;
    } catch (error) {
      closeGameMicrophone();
      setMicrophoneInputs([]);
      setMicrophoneSelection(null);
      recognitionProblem(error);
      return null;
    }
  }

  async function selectMicrophone(deviceId: string) {
    const selection = microphoneInputs.find(
      (input) => input.deviceId === deviceId,
    );
    setMicrophoneRoute(null);
    setMicrophoneSelection(selection ?? null);

    if (!selection) {
      closeGameMicrophone();
      setMicrophoneState("choosing");
      return;
    }

    window.localStorage.setItem(SAVED_MICROPHONE_KEY, selection.deviceId);
    setFeedback(null);
    await activateGameMicrophone(selection);
  }

  async function stopListening() {
    const session = recognitionRef.current;
    if (!session || isEvaluating) return;

    recognitionRef.current = null;
    setIsListening(false);
    setIsEvaluating(true);
    setPartialTranscript("");
    if (recordingTimerRef.current !== null) {
      window.clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    const runId = recognitionRunRef.current;
    try {
      const result = await session.finish();
      if (recognitionRunRef.current !== runId) return;
      handleTranscripts([result.transcript]);
    } catch (error) {
      if (recognitionRunRef.current === runId) recognitionProblem(error);
    } finally {
      if (recognitionRunRef.current === runId) setIsEvaluating(false);
    }
  }

  async function startListening() {
    if (
      !currentBubble ||
      currentBubble.mode !== "speak" ||
      isListening ||
      isEvaluating ||
      isAdvancing
    ) {
      return;
    }

    if (!window.isSecureContext) {
      setFeedback({
        tone: "failure",
        kind: "error",
        detail:
          "あんぜんな URL が ひつようです — microphone access needs a trusted HTTPS or localhost URL.",
      });
      return;
    }

    const runId = recognitionRunRef.current + 1;
    recognitionRunRef.current = runId;

    let gameMicrophone = gameMicrophoneRef.current;
    if (!gameMicrophone?.active) {
      let selectedMicrophone = microphoneSelection;
      if (!selectedMicrophone) {
        selectedMicrophone = await configureMicrophone();
        if (recognitionRunRef.current !== runId || !selectedMicrophone) return;
        gameMicrophone = gameMicrophoneRef.current;
      } else {
        gameMicrophone = await activateGameMicrophone(selectedMicrophone);
      }
      if (recognitionRunRef.current !== runId || !gameMicrophone) return;
    }

    if (recognitionState !== "ready") {
      setFeedback({
        tone: "notice",
        kind: "error",
        detail:
          "ローカルモデルを よみこんでいます — first use downloads about 48 MB.",
      });
      const ready = await prepareRecognition();
      if (recognitionRunRef.current !== runId) return;
      if (!ready) {
        recognitionProblem(
          new LocalRecognitionError(
            "model-unavailable",
            "Local model failed to load",
          ),
        );
        return;
      }
    }

    if (
      !navigator.mediaDevices?.getUserMedia ||
      !("AudioWorkletNode" in window)
    ) {
      recognitionProblem(
        new Error("This browser cannot capture local recognition audio"),
      );
      return;
    }

    setFeedback(null);
    setPartialTranscript("");

    try {
      const session = await startLocalRecognition(
        (partial) => {
          if (recognitionRunRef.current === runId) {
            setPartialTranscript(partial);
          }
        },
        gameMicrophone,
      );
      if (recognitionRunRef.current !== runId) {
        await session.cancel();
        return;
      }

      recognitionRef.current = session;
      setMicrophoneRoute(gameMicrophone.route);
      setMicrophoneState("selected");
      setIsListening(true);
      recordingTimerRef.current = window.setTimeout(() => {
        recordingTimerRef.current = null;
        void stopListening();
      }, 20_000);
    } catch (error) {
      recognitionRef.current = null;
      setIsListening(false);
      if (recognitionRunRef.current === runId) recognitionProblem(error);
    }
  }

  function skipBubble() {
    if (screen !== "conversation") return;

    // Skipping a transition card releases the break itself. It is not a bubble,
    // so it never consumes the one bubble Skip is defined to dismiss.
    if (interludeStage !== null) {
      releaseInterlude();
      return;
    }

    const decision = resolveBubbleEvent("skip", failedAttempts);
    if (decision.advance) advanceBubble();
  }

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  if (artReviewPackId) {
    return <ArtReview pack={getArtPack(artReviewPackId)} />;
  }

  if (screen === "menu") {
    return (
      <main className="library-screen">
        <header className="library-header">
          <div className="library-mark">
            <span>NIHONGO MONOGATARI</span>
            <b>声にする物語</b>
          </div>
          <div>
            <p className="library-kicker">STAGE LIBRARY</p>
            <h1>ステージを選ぶ</h1>
            <p className="library-intro">
              Choose any stage. Starting earlier continues through the rest of
              that story.
            </p>
          </div>
          {installPrompt ? (
            <button
              className="secondary-action install-action"
              onClick={installApp}
              type="button"
            >
              Install app
            </button>
          ) : null}
        </header>

        <section className="story-library" aria-label="Stage selection">
          {STORIES.map((story) => {
            const pack = getArtPack(story.artPackId);
            return (
              <article className="story-card" key={story.id}>
                <div className="story-card-art">
                  <img src={pack.cover} alt="" />
                  <span>{pack.labels.volume}</span>
                </div>
                <div className="story-card-content">
                  <p className="story-number">
                    {String(story.stages.length).padStart(2, "0")} STAGES
                  </p>
                  <h2>{story.title.ja}</h2>
                  <p className="story-title-en">{story.title.en}</p>
                  <ol className="stage-menu">
                    {story.stages.map((stage, stageIndex) => (
                      <li key={stage.id}>
                        <button
                          data-testid={`select-stage-${stage.id}`}
                          onClick={() => beginStage(story, stageIndex)}
                          type="button"
                        >
                          <span className="stage-menu-number">
                            {String(stage.number).padStart(2, "0")}
                          </span>
                          <span className="stage-menu-title">
                            <b>{stage.jpTitle}</b>
                            <small>{stage.title}</small>
                          </span>
                          <span className="stage-menu-meta">
                            {stage.bubbles.length} BUBBLES
                            <br />
                            {
                              stage.bubbles.filter(
                                (bubble) => bubble.mode === "speak",
                              ).length
                            }{" "}
                            TO SPEAK
                          </span>
                          <span className="stage-menu-arrow" aria-hidden="true">
                            →
                          </span>
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>
              </article>
            );
          })}
        </section>

        <footer className="library-footer">
          <p className="flow-rule">
            1回成功、3回失敗、またはスキップで進みます。 Skip always
            dismisses exactly one bubble.
          </p>
          <p className="privacy-note">
            ローカルにんしき · ろくおんは のこりません — recognition runs
            on this device; audio is not saved. First use downloads about 48 MB.
          </p>
        </footer>
      </main>
    );
  }

  if (screen === "complete") {
    return (
      <main className="end-screen">
        <div className="end-rule" aria-hidden="true" />
        <p className="end-kicker">STORY COMPLETE</p>
        <h1>おしまい</h1>
        <p className="end-cont">よくがんばりました</p>
        <p className="end-caption">
          You finished {selectedStory.title.en}.
        </p>
        <div className="end-actions">
          <button
            className="primary-action"
            data-testid="start-again"
            onClick={() => beginStage(selectedStory, startingStageIndex)}
            type="button"
          >
            もう一回
          </button>
          <button
            className="secondary-action"
            onClick={exitConversation}
            type="button"
          >
            ステージ一覧へ
          </button>
        </div>
      </main>
    );
  }

  const attemptSucceeded =
    feedback?.kind === "attempt" && feedback.tone === "success";
  const attemptMissed =
    feedback?.kind === "attempt" && feedback.tone !== "success";
  const characterMood: CharacterMood = attemptSucceeded
    ? "positive"
    : attemptMissed
      ? "concerned"
      : "neutral";
  const characterDim = currentBubble.mode === "speak" && !attemptSucceeded;
  const failureMarks =
    attemptMissed && feedback.transcript
      ? markReadingHits(currentBubble.reading, feedback.transcript)
      : undefined;

  const panelTitle = isListening
    ? "聞いています"
    : isEvaluating
      ? "このデバイスで確認しています"
      : recognitionState === "loading"
        ? "ローカルモデルを読み込み中"
        : attemptSucceeded
          ? "よくできました"
          : feedback?.kind === "attempt"
            ? feedback.tone === "notice"
              ? "次へ進みます"
              : "もう一度"
            : feedback?.kind === "error"
              ? "確認してください"
              : "話してみて";

  const recordLabel = isListening
    ? "録音をおわる"
    : isEvaluating
      ? "このデバイスで確認中"
      : recognitionState === "loading"
        ? "ローカルモデルを読み込み中"
        : failedAttempts > 0
          ? "もう一度はなす"
          : "はなす";

  const microphoneStatus =
    microphoneState === "loading"
      ? "Checking available microphone inputs…"
      : microphoneState === "route-lost"
        ? "Input route changed — reconnection required"
        : microphoneRoute?.status === "matched"
          ? `${microphoneRoute.activeLabel} · game-session mic active · browser route matched · hardware test open`
          : microphoneRoute?.status === "browser-default"
            ? `${microphoneRoute.activeLabel} · game-session mic active · system route · hardware test open`
            : microphoneRoute?.status === "unverifiable"
              ? `${microphoneRoute.activeLabel} · game-session mic active · browser route unverifiable · hardware test open`
              : microphoneSelection
                ? `${microphoneSelection.label} · selected · hardware test open`
                : microphoneState === "choosing"
                  ? "Choose the connected headset microphone"
                  : "Microphone not confirmed · hardware test open";

  // The stage owns the shot: during a transition the position has already moved
  // to the incoming stage, so the card is drawn over the background it opens on.
  const activeStage = stages[currentBubble.stageIndex];
  const activeScene = getScene(artPack, activeStage.sceneId);
  const activeCharacter = getCharacter(artPack, activeStage.castId);
  const isInterlude = interludeStage !== null;

  const sceneStyle = {
    "--character-height-mobile": `${activeCharacter.heightPercent.mobile}%`,
    "--character-height-desktop": `${activeCharacter.heightPercent.desktop}%`,
    "--character-bottom": `${activeCharacter.bottomPercent}%`,
  } as CSSProperties;

  return (
    <main className="conversation-screen">
      <header className="conversation-header">
        <button className="frame-button" onClick={exitConversation} type="button">
          やめる
        </button>
        <div className="stage-title">
          <small>
            STAGE {currentBubble.stageNumber} / {stages.length}
          </small>
          <strong>{currentBubble.stageJpTitle}</strong>
        </div>
        <button
          className="frame-button right"
          data-testid="skip-bubble"
          onClick={skipBubble}
          type="button"
        >
          スキップ
        </button>
      </header>

      <div
        className="progress"
        aria-label={`Bubble ${position + 1} of ${flow.length}`}
      >
        <span>
          {String(position + 1).padStart(2, "0")} /{" "}
          {String(flow.length).padStart(2, "0")}
        </span>
        <div className="progress-cells">
          {flow.map((bubble, index) => (
            <i
              className={
                index < position
                  ? "done"
                  : index === position
                    ? "current"
                    : ""
              }
              key={bubble.id}
            />
          ))}
        </div>
      </div>

      <section
        className={`scene anchor-${activeCharacter.anchor}${
          isInterlude ? " interlude" : ""
        }`}
        aria-label={isInterlude ? "Scene transition" : "Current dialogue bubble"}
        style={sceneStyle}
      >
        <SceneBackground key={activeStage.sceneId} scene={activeScene} />
        <div className="scene-wash" aria-hidden="true" />
        {isInterlude ? (
          <>
            <div className="interlude-veil" aria-hidden="true" />
            <TransitionCard stage={activeStage} />
          </>
        ) : (
          <>
            <OtherPartyCharacter
              mood={characterMood}
              dim={characterDim}
              character={activeCharacter}
            />
            <DialogueBalloon
              bubble={currentBubble}
              showStatus={currentBubble.mode === "autoplay" && isSpeaking}
              marks={failureMarks}
              character={activeCharacter}
            />
            {attemptSucceeded ? (
              <div className="scene-status success">次へ</div>
            ) : null}
            {attemptMissed ? (
              <div className="scene-status failure">もう一度</div>
            ) : null}
            {isListening ? (
              <div className="mic-bars" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
            ) : null}
          </>
        )}
      </section>

      <section className="practice-panel">
        {isInterlude ? (
          <>
            <div className="panel-lead">
              <h2>まくあい</h2>
              <p>場面が変わります — the scene changes; this continues on its own.</p>
            </div>
            <button
              className="primary-action speak-action"
              data-testid="continue-transition"
              onClick={releaseInterlude}
              type="button"
            >
              つづける
            </button>
            <p className="panel-foot">ナレーション — narration</p>
          </>
        ) : currentBubble.mode === "speak" ? (
          <>
            <div className="panel-lead">
              <h2>{panelTitle}</h2>
              {feedback ? (
                <p data-testid="feedback" role="status">
                  {feedback.detail}
                </p>
              ) : (
                <p>マイクを押して、ふきだしを読んでください。</p>
              )}
            </div>

            <button
              className={`primary-action speak-action${isListening ? " live" : ""}`}
              data-recognition-state={recognitionState}
              data-testid="record"
              disabled={
                isAdvancing ||
                isEvaluating ||
                microphoneState === "loading" ||
                recognitionState === "loading"
              }
              onClick={() => {
                if (isListening) {
                  void stopListening();
                } else {
                  void startListening();
                }
              }}
              type="button"
            >
              <MicMark />
              {recordLabel}
            </button>

            <div className="attempts">
              <i className={failedAttempts >= 1 ? "used" : ""} />
              <i className={failedAttempts >= 2 ? "used" : ""} />
              <i className={failedAttempts >= 3 ? "used" : ""} />
              <small>
                {feedback?.kind === "attempt" && feedback.tone === "failure"
                  ? `のこり ${3 - failedAttempts}かい`
                  : `${Math.min(failedAttempts + 1, 3)} / 3`}
              </small>
            </div>

            <div
              className={`microphone-route state-${microphoneState}`}
              data-microphone-state={microphoneState}
              data-testid="microphone-route"
            >
              <span>MIC INPUT</span>
              {microphoneInputs.length > 0 ? (
                <select
                  aria-label="Microphone input"
                  disabled={isListening || isEvaluating}
                  onChange={(event) => {
                    void selectMicrophone(event.target.value);
                  }}
                  value={microphoneSelection?.deviceId ?? ""}
                >
                  <option value="">マイクを選ぶ</option>
                  {microphoneInputs.map((input) => (
                    <option key={input.deviceId} value={input.deviceId}>
                      {input.label}
                      {input.deviceId === "default" ? " — system route" : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <button
                  disabled={
                    isListening ||
                    isEvaluating ||
                    microphoneState === "loading"
                  }
                  onClick={() => void configureMicrophone()}
                  type="button"
                >
                  {microphoneState === "loading"
                    ? "確認中"
                    : "マイクを確認"}
                </button>
              )}
              <small>{microphoneStatus}</small>
              {microphoneInputs.length > 0 ? (
                <button
                  disabled={isListening || isEvaluating}
                  onClick={() => void configureMicrophone()}
                  type="button"
                >
                  再確認
                </button>
              ) : null}
            </div>

            <p className="panel-foot">
              ローカルにんしき · ろくおんは のこりません — on-device Vosk;
              audio is not saved
              {isListening && partialTranscript ? (
                <>
                  <br />
                  Listening: 「{partialTranscript}」
                </>
              ) : null}
              {feedback?.transcript ? (
                <>
                  <br />
                  Vosk heard: 「{feedback.transcript}」
                </>
              ) : null}
            </p>

            {qaMode ? (
              <div className="qa-controls" aria-label="Development flow controls">
                <button
                  data-testid="qa-pass"
                  disabled={isAdvancing}
                  onClick={() => handleTranscripts([currentBubble.japanese])}
                  type="button"
                >
                  QA success
                </button>
                <button
                  data-testid="qa-near"
                  disabled={isAdvancing}
                  onClick={() =>
                    handleTranscripts([nearMissTranscript(currentBubble.reading)])
                  }
                  type="button"
                >
                  QA near-miss
                </button>
                <button
                  data-testid="qa-fail"
                  disabled={isAdvancing}
                  onClick={() => handleTranscripts(["違う文です"])}
                  type="button"
                >
                  QA failure
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <>
            <div className="panel-lead autoplay">
              <h2>聞いてみよう</h2>
              <p>
                自動で進みます — autoplay · tap スキップ to move on now.
              </p>
            </div>
            <div className="autoplay-controls">
              <button
                aria-label="Replay this autoplay line"
                className="replay-action"
                data-testid="replay-autoplay"
                onClick={replayCurrentAutoplay}
                type="button"
              >
                ↺ もう一度聞く
              </button>
              <div className="autoplay-state">
                <span className="sound-line" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                {isSpeaking ? "さいせい中" : "つぎへ"}
              </div>
            </div>
            <p className="panel-foot">
              ろくおんは のこりません — Audio is not saved by this app.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
