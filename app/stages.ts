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

export type PracticeStage = {
  id: string;
  number: number;
  title: string;
  jpTitle: string;
  bubbles: DialogueBubble[];
};

export const STAGES: PracticeStage[] = [
  {
    id: "ordering",
    number: 1,
    title: "Ordering",
    jpTitle: "ご注文",
    bubbles: [
      {
        id: "ordering-welcome",
        speaker: "staff",
        mode: "autoplay",
        japanese: "いらっしゃいませ。どうぞお入りください。",
        reading: "いらっしゃいませ。どうぞおはいりください。",
        translation: "Welcome, please come in.",
        audioSrc: "/audio/qwen3/ordering-welcome.mp3",
      },
      {
        id: "ordering-question",
        speaker: "staff",
        mode: "autoplay",
        japanese: "ご注文は何になさいますか。",
        reading: "ごちゅうもんはなになさいますか。",
        translation: "What can I bring for you?",
        audioSrc: "/audio/qwen3/ordering-question.mp3",
      },
      {
        id: "ordering-second",
        speaker: "learner",
        mode: "autoplay",
        japanese: "あ、ちょっと待ってください。",
        reading: "あ、ちょっとまってください。",
        translation: "Oh, give me a second.",
        audioSrc: "/audio/qwen3/ordering-second.mp3",
      },
      {
        id: "ordering-menu",
        speaker: "learner",
        mode: "autoplay",
        japanese: "メニューはどこですか。",
        reading: "めにゅーはどこですか。",
        translation: "Where is the menu?",
        audioSrc: "/audio/qwen3/ordering-menu.mp3",
      },
      {
        id: "ordering-order",
        speaker: "learner",
        mode: "speak",
        japanese: "ハンバーガーを二つと、ビールを一つください。",
        reading: "はんばーがーをふたつと、びーるをひとつください。",
        translation: "Two burgers, one beer.",
        accepted: [
          "ハンバーガー二つとビール一つください",
          "ハンバーガーを二つ、ビールを一つください",
        ],
      },
      {
        id: "ordering-thanks",
        speaker: "staff",
        mode: "autoplay",
        japanese: "はい、ご注文ありがとうございます。",
        reading: "はい、ごちゅうもんありがとうございます。",
        translation: "Yes sir, thank you for the ordering.",
        audioSrc: "/audio/qwen3/ordering-thanks.mp3",
      },
    ],
  },
  {
    id: "meal",
    number: 2,
    title: "The meal",
    jpTitle: "お食事",
    bubbles: [
      {
        id: "meal-arrives",
        speaker: "staff",
        mode: "autoplay",
        japanese: "お料理をお持ちしました。",
        reading: "おりょうりをおもちしました。",
        translation: "Here is the meal.",
        audioSrc: "/audio/qwen3/meal-arrives.mp3",
      },
      {
        id: "meal-serve",
        speaker: "learner",
        mode: "speak",
        japanese:
          "彼女にはチキンバーガーを、私にはビールとビーフバーガーをお願いします。",
        reading:
          "かのじょにはちきんばーがーを、わたしにはびーるとびーふばーがーをおねがいします。",
        translation:
          "Please chicken burger for lady, beer and beef burger for me.",
        accepted: [
          "彼女にチキンバーガー、私にビールとビーフバーガーをお願いします",
        ],
      },
      {
        id: "meal-restroom",
        speaker: "learner",
        mode: "speak",
        japanese: "お手洗いはどこですか。",
        reading: "おてあらいはどこですか。",
        translation: "Where is the restroom?",
        accepted: ["トイレはどこですか"],
      },
    ],
  },
];

export type FlowBubble = DialogueBubble & {
  stageId: string;
  stageNumber: number;
  stageTitle: string;
  stageJpTitle: string;
};

export const FLOW: FlowBubble[] = STAGES.flatMap((stage) =>
  stage.bubbles.map((bubble) => ({
    ...bubble,
    stageId: stage.id,
    stageNumber: stage.number,
    stageTitle: stage.title,
    stageJpTitle: stage.jpTitle,
  })),
);
