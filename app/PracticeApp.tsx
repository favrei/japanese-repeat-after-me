"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { resolveBubbleEvent } from "./flow";
import { scoreAttempt } from "./scoring";
import { FLOW, STAGES, type FlowBubble } from "./stages";

type Screen = "welcome" | "conversation" | "complete";
type FeedbackTone = "success" | "failure" | "notice";

type Feedback = {
  tone: FeedbackTone;
  title: string;
  detail: string;
  transcript?: string;
};

type RecognitionAlternativeLike = {
  transcript: string;
  confidence: number;
};

type RecognitionResultLike = {
  [index: number]: RecognitionAlternativeLike;
  length: number;
};

type RecognitionEventLike = {
  results: {
    [index: number]: RecognitionResultLike;
    length: number;
  };
};

type RecognitionErrorLike = {
  error: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: RecognitionEventLike) => void) | null;
  onerror: ((event: RecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function playJapanese(text: string) {
  return new Promise<void>((resolve) => {
    if (!("speechSynthesis" in window)) {
      setTimeout(resolve, 650);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    utterance.lang = "ja-JP";
    utterance.rate = 0.82;
    utterance.voice =
      voices.find((voice) => voice.lang.toLowerCase().startsWith("ja")) ?? null;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

function DialogueBubble({
  bubble,
  showStatus,
}: {
  bubble: FlowBubble;
  showStatus: boolean;
}) {
  const isLearner = bubble.speaker === "learner";

  return (
    <article
      className={`dialogue-bubble ${isLearner ? "is-learner" : "is-staff"}`}
      data-testid={`bubble-${bubble.id}`}
    >
      <div className="bubble-label">
        <span>{isLearner ? "You" : "Staff"}</span>
        {bubble.mode === "autoplay" ? <span>Autoplay</span> : null}
      </div>
      <p className="bubble-japanese">{bubble.japanese}</p>
      <p className="bubble-reading">{bubble.reading}</p>
      <p className="bubble-translation">{bubble.translation}</p>
      {showStatus ? (
        <p className="bubble-status" aria-live="polite">
          Playing automatically…
        </p>
      ) : null}
    </article>
  );
}

export function PracticeApp() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [position, setPosition] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [qaMode, setQaMode] = useState(false);
  const [installPrompt, setInstallPrompt] =
    useState<InstallPromptEvent | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const playbackRunRef = useRef(0);

  const currentBubble = FLOW[position];

  useEffect(() => {
    const qaTimer = window.setTimeout(() => {
      setQaMode(
        process.env.NODE_ENV !== "production" &&
          new URLSearchParams(window.location.search).get("qa") === "1",
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
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    window.speechSynthesis?.cancel();
    setIsListening(false);
    setIsSpeaking(false);
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  const advanceBubble = useCallback(() => {
    cancelActiveMedia();
    setFailedAttempts(0);
    setFeedback(null);
    setIsAdvancing(false);

    if (position >= FLOW.length - 1) {
      setScreen("complete");
      return;
    }

    setPosition((current) => current + 1);
  }, [cancelActiveMedia, position]);

  useEffect(() => {
    if (
      screen !== "conversation" ||
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
        : playJapanese(currentBubble.japanese);

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
        window.speechSynthesis?.cancel();
      }
    };
  }, [advanceBubble, currentBubble, qaMode, screen]);

  useEffect(() => {
    return () => cancelActiveMedia();
  }, [cancelActiveMedia]);

  function beginConversation() {
    cancelActiveMedia();
    setPosition(0);
    setFailedAttempts(0);
    setFeedback(null);
    setIsAdvancing(false);
    setScreen("conversation");
  }

  function exitConversation() {
    cancelActiveMedia();
    setScreen("welcome");
    setPosition(0);
    setFailedAttempts(0);
    setFeedback(null);
    setIsAdvancing(false);
  }

  function scheduleAdvance(delay = 450) {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
    }
    setIsAdvancing(true);
    advanceTimerRef.current = window.setTimeout(() => {
      advanceTimerRef.current = null;
      advanceBubble();
    }, delay);
  }

  function handleTranscripts(transcripts: string[]) {
    if (!currentBubble || currentBubble.mode !== "speak" || isAdvancing) return;

    const result = scoreAttempt(transcripts, currentBubble);
    const decision = resolveBubbleEvent(
      result.passed ? "success" : "failure",
      failedAttempts,
    );

    if (result.passed) {
      setFeedback({
        tone: "success",
        title: "Success",
        detail: "Moving to the next bubble.",
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
        title: "Three failed attempts",
        detail: "Moving to the next bubble.",
        transcript: result.transcript,
      });
      scheduleAdvance(650);
      return;
    }

    setFeedback({
      tone: "failure",
      title: "Try again",
      detail: `${3 - decision.failedAttempts} ${
        3 - decision.failedAttempts === 1 ? "attempt" : "attempts"
      } remaining.`,
      transcript: result.transcript,
    });
  }

  function recognitionProblem(error: string) {
    const permissionDenied =
      error === "not-allowed" || error === "service-not-allowed";
    setFeedback({
      tone: "failure",
      title: permissionDenied
        ? "Microphone permission is needed"
        : "Speech was not captured",
      detail: permissionDenied
        ? "Allow microphone access in Chrome, then try again or use Skip."
        : "This technical error does not count as a failed attempt.",
    });
  }

  function stopListening() {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setIsListening(false);
  }

  function startListening() {
    if (
      !currentBubble ||
      currentBubble.mode !== "speak" ||
      isListening ||
      isAdvancing
    ) {
      return;
    }

    const Recognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      setFeedback({
        tone: "failure",
        title: "Speech recognition is unavailable",
        detail: "Use Android Chrome for this PoC, or use Skip.",
      });
      return;
    }

    setFeedback(null);
    const recognition = new Recognition();
    recognition.lang = "ja-JP";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const latest = event.results[event.results.length - 1];
      const transcripts = Array.from(
        { length: latest.length },
        (_, index) => latest[index].transcript,
      );
      handleTranscripts(transcripts);
    };
    recognition.onerror = (event) => recognitionProblem(event.error);
    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };
    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
      recognitionProblem("start-failed");
    }
  }

  function skipBubble() {
    if (screen !== "conversation") return;
    const decision = resolveBubbleEvent("skip", failedAttempts);
    if (decision.advance) advanceBubble();
  }

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  if (screen === "welcome") {
    return (
      <main className="poc-shell welcome-screen">
        <header className="plain-header">
          <span>UX flow PoC</span>
          <span>Android Chrome PWA</span>
        </header>

        <section className="welcome-content">
          <p className="overline">Japanese conversation</p>
          <h1>Café conversation</h1>
          <p className="welcome-copy">
            One continuous conversation across two stages. Autoplay bubbles move
            on by themselves. You speak when prompted.
          </p>

          <ol className="stage-summary" aria-label="Conversation stages">
            {STAGES.map((stage) => (
              <li key={stage.id}>
                <span>Stage {stage.number}</span>
                <strong>{stage.title}</strong>
                <small>
                  {stage.bubbles.length} bubbles ·{" "}
                  {
                    stage.bubbles.filter((bubble) => bubble.mode === "speak")
                      .length
                  }{" "}
                  for you to speak
                </small>
              </li>
            ))}
          </ol>

          <button
            className="primary-action"
            data-testid="start-conversation"
            onClick={beginConversation}
            type="button"
          >
            Start conversation
          </button>

          <p className="flow-rule">
            A speaking bubble ends after one success, three failed attempts, or
            Skip. Skip always dismisses exactly one bubble.
          </p>
        </section>

        <footer className="plain-footer">
          <span>Audio is not saved by this app.</span>
          {installPrompt ? (
            <button onClick={installApp} type="button">
              Install app
            </button>
          ) : null}
        </footer>
      </main>
    );
  }

  if (screen === "complete") {
    return (
      <main className="poc-shell complete-screen">
        <div className="complete-content">
          <p className="overline">Finished</p>
          <h1>Conversation complete</h1>
          <p>You reached the end of both stages.</p>
          <button
            className="primary-action"
            data-testid="start-again"
            onClick={beginConversation}
            type="button"
          >
            Start again
          </button>
          <button className="secondary-action" onClick={exitConversation} type="button">
            Back to start
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="conversation-screen">
      <header className="conversation-header">
        <button onClick={exitConversation} type="button">
          Exit
        </button>
        <div>
          <span>
            Stage {currentBubble.stageNumber} of {STAGES.length}
          </span>
          <strong>{currentBubble.stageTitle}</strong>
        </div>
        <button
          data-testid="skip-bubble"
          onClick={skipBubble}
          type="button"
        >
          Skip
        </button>
      </header>

      <div
        className="bubble-progress"
        aria-label={`Bubble ${position + 1} of ${FLOW.length}`}
      >
        <span>
          Bubble {position + 1} of {FLOW.length}
        </span>
        <div>
          {FLOW.map((bubble, index) => (
            <i
              className={
                index < position
                  ? "is-complete"
                  : index === position
                    ? "is-current"
                    : ""
              }
              key={bubble.id}
            />
          ))}
        </div>
      </div>

      <section className="bubble-stage" aria-label="Current dialogue bubble">
        <DialogueBubble
          bubble={currentBubble}
          showStatus={currentBubble.mode === "autoplay" && isSpeaking}
        />
      </section>

      <section className="interaction-panel">
        {currentBubble.mode === "speak" ? (
          <>
            <div className="attempt-heading">
              <div>
                <p className="overline">Your turn</p>
                <h2>Speak this sentence</h2>
              </div>
              <span>Attempt {Math.min(failedAttempts + 1, 3)} of 3</span>
            </div>

            {feedback ? (
              <div
                className={`feedback ${feedback.tone}`}
                data-testid="feedback"
                role="status"
              >
                <strong>{feedback.title}</strong>
                <span>{feedback.detail}</span>
                {feedback.transcript ? (
                  <small>Chrome heard: 「{feedback.transcript}」</small>
                ) : null}
              </div>
            ) : null}

            <button
              className={`speak-action ${isListening ? "is-listening" : ""}`}
              data-testid="record"
              disabled={isAdvancing}
              onClick={isListening ? stopListening : startListening}
              type="button"
            >
              {isListening ? "Stop listening" : "Start speaking"}
              <small>Audio is not saved</small>
            </button>

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
          <div className="autoplay-panel" aria-live="polite">
            <p className="overline">Autoplay</p>
            <h2>{isSpeaking ? "Playing this bubble" : "Moving on"}</h2>
            <p>You can tap Skip to dismiss it immediately.</p>
          </div>
        )}
      </section>
    </main>
  );
}
