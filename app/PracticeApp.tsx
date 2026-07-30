"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { resolveBubbleEvent } from "./flow";
import {
  markReadingHits,
  normalizeJapanese,
  scoreAttempt,
  type ReadingMark,
} from "./scoring";
import { FLOW, STAGES, type FlowBubble } from "./stages";

type Screen = "welcome" | "conversation" | "complete";
type FeedbackTone = "success" | "failure" | "notice";

type Feedback = {
  tone: FeedbackTone;
  kind: "attempt" | "error";
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

/** Development-only: a half-right version of the line for near-miss QA. */
function nearMissTranscript(reading: string) {
  return Array.from(normalizeJapanese(reading))
    .map((char, index) => (index % 2 === 0 ? "ま" : char))
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

type CharMood = "neutral" | "happy" | "sad";

function StaffCharacter({ mood, dim }: { mood: CharMood; dim: boolean }) {
  return (
    <svg
      className={`char${dim ? " dim" : ""}`}
      viewBox="0 0 150 220"
      aria-hidden="true"
    >
      <ellipse
        cx="118"
        cy="130"
        rx="26"
        ry="8"
        fill="#8a5a34"
        stroke="#1c1a17"
        strokeWidth="3"
      />
      <rect
        x="40"
        y="92"
        width="70"
        height="128"
        rx="20"
        fill="#fff"
        stroke="#1c1a17"
        strokeWidth="3"
      />
      <path
        d="M48 108 h54 v112 h-54 z"
        fill="#6b4225"
        stroke="#1c1a17"
        strokeWidth="3"
      />
      <rect
        x="66"
        y="108"
        width="18"
        height="30"
        fill="#ffd23f"
        stroke="#1c1a17"
        strokeWidth="2.5"
      />
      <circle
        cx="75"
        cy="56"
        r="32"
        fill="#ffe8d6"
        stroke="#1c1a17"
        strokeWidth="3"
      />
      <path
        d="M43 52 a32 32 0 0 1 64 0 l-6 2 a26 24 0 0 0 -52 0 z"
        fill="#1c1a17"
      />
      {mood === "happy" ? (
        <>
          <path
            d="M58 56 q6 -6 12 0"
            fill="none"
            stroke="#1c1a17"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M80 56 q6 -6 12 0"
            fill="none"
            stroke="#1c1a17"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M66 68 q9 8 18 0"
            fill="none"
            stroke="#1c1a17"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx="64" cy="58" r="3.2" fill="#1c1a17" />
          <circle cx="86" cy="58" r="3.2" fill="#1c1a17" />
          {mood === "sad" ? (
            <path
              d="M68 72 q7 -5 14 0"
              fill="none"
              stroke="#1c1a17"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M68 70 q7 6 14 0"
              fill="none"
              stroke="#1c1a17"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}
        </>
      )}
      {mood !== "sad" ? (
        <>
          <circle cx="56" cy="66" r="4" fill="#ffb3a7" opacity=".7" />
          <circle cx="94" cy="66" r="4" fill="#ffb3a7" opacity=".7" />
        </>
      ) : null}
    </svg>
  );
}

function DialogueBalloon({
  bubble,
  showStatus,
  marks,
}: {
  bubble: FlowBubble;
  showStatus: boolean;
  marks?: ReadingMark[];
}) {
  const isLearner = bubble.speaker === "learner";

  return (
    <article
      className={`bl ${isLearner ? "right" : "left"}`}
      data-testid={`bubble-${bubble.id}`}
    >
      <span className={`who ${isLearner ? "you" : "staff"}`}>
        {isLearner ? "あなた" : "てんいん"}
      </span>
      {bubble.mode === "autoplay" && showStatus ? (
        <span className="playing">♪ AUTO</span>
      ) : null}
      <p className="jp">{bubble.japanese}</p>
      {marks ? (
        <p className="rd marked">
          {marks.map((mark, index) => (
            <span className={mark.state} key={`${mark.char}-${index}`}>
              {mark.char}
            </span>
          ))}
        </p>
      ) : (
        <p className="rd">{bubble.reading}</p>
      )}
      <p className="en">{bubble.translation}</p>
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
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const playbackRunRef = useRef(0);

  const currentBubble = FLOW[position];

  useEffect(() => {
    if (window.location.hostname === "0.0.0.0") {
      const trustedLocalUrl = new URL(window.location.href);
      trustedLocalUrl.hostname = "localhost";
      window.location.replace(trustedLocalUrl);
      return;
    }

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
    activeAudioRef.current?.pause();
    activeAudioRef.current = null;
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

  function recognitionProblem(error: string) {
    const permissionDenied =
      error === "not-allowed" || error === "service-not-allowed";
    setFeedback({
      tone: "failure",
      kind: "error",
      detail: permissionDenied
        ? "マイクの きょかが ひつようです — allow microphone access in Chrome, then try again or use Skip."
        : "きこえませんでした — technical error; this does not count as a failed attempt.",
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

    if (!window.isSecureContext) {
      setFeedback({
        tone: "failure",
        kind: "error",
        detail:
          "マイクには HTTPS または localhost が必要です — open this app on a trusted HTTPS or localhost URL.",
      });
      return;
    }

    const Recognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      setFeedback({
        tone: "failure",
        kind: "error",
        detail:
          "この ブラウザでは おんせいにんしきが つかえません — use Android Chrome for this PoC, or use Skip.",
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
      <main className="cover-screen">
        <div className="book">
          <span className="vol">第1巻</span>
          <h1>
            にほんご
            <br />
            <span className="hl">ものがたり</span>
          </h1>
          <p className="sub">SPEAK-THE-LINE STORY PRACTICE</p>
          <div className="art">
            <span>STORY COVER — 喫茶店</span>
            <span>(swappable story art slot)</span>
          </div>
          <ol className="chapters" aria-label="Conversation stages">
            {STAGES.map((stage) => (
              <li key={stage.id}>
                <b>
                  第{stage.number}話 {stage.jpTitle}
                </b>
                <small>
                  {stage.bubbles.length} bubbles ·{" "}
                  {
                    stage.bubbles.filter((bubble) => bubble.mode === "speak")
                      .length
                  }{" "}
                  to speak
                </small>
              </li>
            ))}
          </ol>
        </div>

        <footer className="cover-foot">
          <button
            className="cta"
            data-testid="start-conversation"
            onClick={beginConversation}
            type="button"
          >
            📖 はじめる！
          </button>
          <p className="flow-rule">
            1かい せいこう、3かい しっぱい、または スキップで すすみます。
            <br />A speaking bubble ends after one success, three failed
            attempts, or Skip. Skip always dismisses exactly one bubble.
          </p>
          <p className="note">
            ろくおんは のこりません — Audio is not saved by this app.
          </p>
          {installPrompt ? (
            <button className="ghost" onClick={installApp} type="button">
              Install app
            </button>
          ) : null}
        </footer>
      </main>
    );
  }

  if (screen === "complete") {
    return (
      <main className="end-screen">
        <span
          className="star"
          style={{ left: "12%", top: "22%", fontSize: 30, rotate: "-14deg" }}
        >
          ✦
        </span>
        <span
          className="star"
          style={{ right: "14%", top: "30%", fontSize: 22, rotate: "10deg" }}
        >
          ✦
        </span>
        <span
          className="star"
          style={{ left: "18%", bottom: "28%", fontSize: 18, rotate: "8deg" }}
        >
          ✦
        </span>
        <div className="big">おしまい！</div>
        <p className="cont">— The End —</p>
        <p className="cap">
          You reached the end of both stages.
          <br />
          よく がんばりました！
        </p>
        <div className="btns">
          <button
            className="cta"
            data-testid="start-again"
            onClick={beginConversation}
            type="button"
          >
            🔁 もういっかい！
          </button>
          <button className="ghost" onClick={exitConversation} type="button">
            表紙にもどる
          </button>
        </div>
      </main>
    );
  }

  const attemptSucceeded = feedback?.kind === "attempt" && feedback.tone === "success";
  const attemptMissed = feedback?.kind === "attempt" && feedback.tone !== "success";
  const charMood: CharMood = attemptSucceeded
    ? "happy"
    : attemptMissed
      ? "sad"
      : "neutral";
  const charDim = currentBubble.mode === "speak" && !attemptSucceeded;

  const failureMarks =
    attemptMissed && feedback.transcript
      ? markReadingHits(currentBubble.reading, feedback.transcript)
      : undefined;

  const sfx: { text: string; className: string } = isListening
    ? { text: "ゴゴゴ…", className: "listen" }
    : attemptSucceeded
      ? { text: "キラキラ✦", className: "win" }
      : attemptMissed
        ? { text: "しょぼん…", className: "miss" }
        : currentBubble.mode === "speak"
          ? { text: "ドキドキ…", className: "speak" }
          : { text: "ざわざわ…", className: "calm" };

  const panelTitle = isListening
    ? "聞いている…"
    : attemptSucceeded
      ? "いいね！"
      : feedback?.kind === "attempt"
        ? feedback.tone === "notice"
          ? "つぎへ！"
          : "もういちど！"
        : feedback?.kind === "error"
          ? "あれれ？"
          : "話してみて！";

  return (
    <main className="conversation-screen">
      <header className="hd">
        <button className="chip" onClick={exitConversation} type="button">
          やめる
        </button>
        <div className="ttl">
          <small>
            STAGE {currentBubble.stageNumber} / {STAGES.length}
          </small>
          <strong>{currentBubble.stageJpTitle}！</strong>
        </div>
        <button
          className="chip"
          data-testid="skip-bubble"
          onClick={skipBubble}
          type="button"
        >
          スキップ
        </button>
      </header>

      <div
        className="pg"
        aria-label={`Bubble ${position + 1} of ${FLOW.length}`}
      >
        <span>
          {position + 1}/{FLOW.length}
        </span>
        <div className="cells">
          {FLOW.map((bubble, index) => (
            <i
              className={
                index < position
                  ? "done"
                  : index === position
                    ? attemptSucceeded
                      ? "win"
                      : "now"
                    : ""
              }
              key={bubble.id}
            />
          ))}
        </div>
      </div>

      <section className="scene" aria-label="Current dialogue bubble">
        <span className={`sfx ${sfx.className}`}>{sfx.text}</span>
        <StaffCharacter mood={charMood} dim={charDim} />
        <div className="wood-counter" aria-hidden="true" />
        <DialogueBalloon
          bubble={currentBubble}
          showStatus={currentBubble.mode === "autoplay" && isSpeaking}
          marks={failureMarks}
        />
        {attemptSucceeded ? <div className="burst win">ピンポン！</div> : null}
        {attemptMissed ? <div className="burst miss">ざんねん…</div> : null}
        {isListening ? (
          <div className="mic-bars" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        ) : null}
      </section>

      <section className="pn">
        {currentBubble.mode === "speak" ? (
          <>
            <div className="row">
              <h2>{panelTitle}</h2>
              <div className="tries">
                {attemptSucceeded ? (
                  <>
                    <i className="clear" />
                    <i />
                    <i />
                    <small>clear!</small>
                  </>
                ) : (
                  <>
                    <i className={failedAttempts >= 1 ? "on" : ""} />
                    <i className={failedAttempts >= 2 ? "on" : ""} />
                    <i className={failedAttempts >= 3 ? "on" : ""} />
                    <small>
                      {feedback?.kind === "attempt" &&
                      feedback.tone === "failure"
                        ? `のこり ${3 - failedAttempts}かい`
                        : `${Math.min(failedAttempts + 1, 3)}/3`}
                    </small>
                  </>
                )}
              </div>
            </div>

            {feedback ? (
              <p className="cap" data-testid="feedback" role="status">
                {feedback.detail}
              </p>
            ) : null}

            <button
              className={`cta${isListening ? " live" : ""}`}
              data-testid="record"
              disabled={isAdvancing}
              onClick={isListening ? stopListening : startListening}
              type="button"
            >
              {isListening
                ? "● 録音中 — おわったら おしてね"
                : failedAttempts > 0
                  ? "🎤 もういちど はなす"
                  : "🎤 はなす！"}
            </button>

            <p className="note">
              ろくおんは のこりません — Audio is not saved
              {feedback?.transcript ? (
                <>
                  <br />
                  Chrome heard: 「{feedback.transcript}」
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
          <div aria-live="polite">
            <div className="row">
              <h2>聞いてみよう</h2>
              <span className="playing-chip">
                {isSpeaking ? "♪ さいせい中" : "つぎへ…"}
              </span>
            </div>
            <p className="cap">
              この ふきだしは じどうで すすみます — autoplay · tap スキップ to
              move on now
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
