// Story bundle: taproom — 初めての一杯
//
// Authored per .agents/documents/stage-design-flow.md. Design rationale,
// character cards, and the separation-gate verdict live in ./story.md.
//
// NOT REGISTERED. The app still loads poc/app/stages.ts. This file exists as
// the bundle's encoded deliverable; wiring a story registry is separate,
// unapproved work.
//
// Types are declared locally rather than imported. The schemaVersion 2 shape
// this story targets — sceneId, castId, transition — lives on the unmerged
// branch design/scene-transitions in the sibling worktree
// japanese-repeat-after-me-scene-transitions, not in poc/app/stages.ts, which
// is still v1. Replace these declarations with an import once v2 reaches the
// nested PoC main; they are copied from that branch verbatim so the swap is
// mechanical.

export type Speaker = "staff" | "learner";
export type BubbleMode = "autoplay" | "speak";

export type DialogueBubble = {
  id: string;
  speaker: Speaker;
  mode: BubbleMode;
  japanese: string;
  reading: string;
  translation: string;
  audioSrc?: string;
  accepted?: string[];
};

export type StageTransition = {
  id: string;
  japanese: string;
  reading: string;
  translation: string;
  audioSrc?: string;
  holdMs?: number;
};

export type PracticeStage = {
  id: string;
  number: number;
  title: string;
  jpTitle: string;
  sceneId: string;
  castId: string;
  transition: StageTransition;
  bubbles: DialogueBubble[];
};

export const STORY = {
  id: "taproom-first-glass",
  artPackId: "taproom",
  title: {
    ja: "初めての一杯",
    en: "The first glass",
  },
} as const;

export const TAPROOM_STAGES: PracticeStage[] = [
  {
    id: "taproom-choose",
    number: 1,
    title: "Choosing",
    jpTitle: "選ぶ",
    sceneId: "board",
    castId: "staff",
    transition: {
      id: "taproom-choose-open",
      japanese: "夜のタップルーム。ドアを開けると、黒板いっぱいにビールの名前が並んでいた。",
      reading:
        "よるのたっぷるーむ。どあをあけると、こくばんいっぱいにびーるのなまえがならんでいた。",
      translation:
        "A taproom at night. You open the door, and the board is covered edge to edge with the names of beers.",
    },
    bubbles: [
      {
        id: "taproom-choose-welcome",
        speaker: "staff",
        mode: "autoplay",
        japanese: "いらっしゃいませ。ご注文はお決まりですか。",
        reading: "いらっしゃいませ。ごちゅうもんはおきまりですか。",
        translation: "Welcome. Have you decided what you'd like?",
      },
      {
        id: "taproom-choose-firsttime",
        speaker: "learner",
        mode: "speak",
        japanese: "あの、初めてなんです。",
        reading: "あの、はじめてなんです。",
        translation: "Um — it's my first time here.",
        accepted: ["初めてなんです", "初めてです", "あの、初めてです"],
      },
      {
        id: "taproom-choose-board",
        speaker: "staff",
        mode: "autoplay",
        japanese: "ごゆっくりどうぞ。本日のビールはこちらのボードにございます。",
        reading:
          "ごゆっくりどうぞ。ほんじつのびーるはこちらのぼーどにございます。",
        translation: "Take your time. Today's beers are on the board here.",
      },
      {
        id: "taproom-choose-recommend",
        speaker: "learner",
        mode: "speak",
        japanese: "おすすめはどれですか。",
        reading: "おすすめはどれですか。",
        translation: "Which one do you recommend?",
        accepted: [
          "どれがおすすめですか",
          "おすすめはなんですか",
          "おすすめはどれでしょうか",
        ],
      },
      {
        id: "taproom-choose-two",
        speaker: "staff",
        mode: "autoplay",
        japanese: "おすすめは、ペールエールと黒ビールです。",
        reading: "おすすめは、ぺーるえーるとくろびーるです。",
        translation: "The recommendations are the pale ale and the dark beer.",
      },
      {
        id: "taproom-choose-bitter",
        speaker: "staff",
        mode: "autoplay",
        japanese: "ペールエールは苦みが少なくて、飲みやすいですよ。",
        reading: "ぺーるえーるはにがみがすくなくて、のみやすいですよ。",
        translation: "The pale ale isn't very bitter, so it's easy to drink.",
      },
      {
        id: "taproom-choose-order",
        speaker: "learner",
        mode: "speak",
        japanese: "じゃあ、ペールエールをお願いします。",
        reading: "じゃあ、ぺーるえーるをおねがいします。",
        translation: "I'll have the pale ale, then.",
        accepted: [
          "ペールエールをお願いします",
          "ペールエールお願いします",
          "じゃあ、ペールエールをください",
          "ペールエールをください",
          "ペールエールで、お願いします",
        ],
      },
    ],
  },
  {
    id: "taproom-glass",
    number: 2,
    title: "The first glass",
    jpTitle: "一杯目",
    sceneId: "counter",
    castId: "staff",
    transition: {
      id: "taproom-glass-open",
      japanese: "タップからビールが注がれ、白い泡が静かに立ち上がった。",
      reading: "たっぷからびーるがそそがれ、しろいあわがしずかにたちのぼった。",
      translation:
        "Beer runs from the tap, and a white head rises quietly.",
    },
    bubbles: [
      {
        id: "taproom-glass-served",
        speaker: "staff",
        mode: "autoplay",
        japanese: "お待たせしました。こちらどうぞ。",
        reading: "おまたせしました。こちらどうぞ。",
        translation: "Thanks for waiting — here you are.",
      },
      {
        id: "taproom-glass-thanks",
        speaker: "learner",
        mode: "autoplay",
        japanese: "ありがとうございます。",
        reading: "ありがとうございます。",
        translation: "Thank you.",
      },
      {
        id: "taproom-glass-pay",
        speaker: "learner",
        mode: "speak",
        japanese: "お会計は今ですか。",
        reading: "おかいけいはいまですか。",
        translation: "Do I pay now?",
        accepted: [
          "会計は今ですか",
          "今お会計ですか",
          "お会計は今でいいですか",
          "お会計は先ですか",
        ],
      },
      {
        id: "taproom-glass-later",
        speaker: "staff",
        mode: "autoplay",
        japanese: "お会計は最後にまとめてお願いします。",
        reading: "おかいけいはさいごにまとめておねがいします。",
        translation: "You can settle up all together at the end.",
      },
      {
        id: "taproom-glass-here",
        speaker: "learner",
        mode: "speak",
        japanese: "ここで飲んでもいいですか。",
        reading: "ここでのんでもいいですか。",
        translation: "Is it all right to drink here?",
        accepted: ["ここで飲んでいいですか", "ここでもいいですか", "ここで大丈夫ですか"],
      },
      {
        id: "taproom-glass-counter",
        speaker: "staff",
        mode: "autoplay",
        japanese:
          "そちらのカウンターをご自由にお使いください。ごゆっくりどうぞ。",
        reading:
          "そちらのかうんたーをごじゆうにおつかいください。ごゆっくりどうぞ。",
        translation: "Feel free to use the counter over there. Enjoy.",
      },
    ],
  },
];
