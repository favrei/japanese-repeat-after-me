export type Speaker = "staff" | "learner";
export type BubbleMode = "autoplay" | "speak";

export type DialogueBubble = {
  id: string;
  speaker: Speaker;
  mode: BubbleMode;
  japanese: string;
  reading: string;
  translation: string;
  accepted?: string[];
};

export type PracticeStage = {
  id: string;
  number: number;
  title: string;
  bubbles: DialogueBubble[];
};

export const STAGES: PracticeStage[] = [
  {
    id: "ordering",
    number: 1,
    title: "Ordering",
    bubbles: [
      {
        id: "ordering-welcome",
        speaker: "staff",
        mode: "autoplay",
        japanese: "いらっしゃいませ。どうぞお入りください。",
        reading: "いらっしゃいませ。どうぞおはいりください。",
        translation: "Welcome, please come in.",
      },
      {
        id: "ordering-question",
        speaker: "staff",
        mode: "autoplay",
        japanese: "ご注文は何になさいますか。",
        reading: "ごちゅうもんはなになさいますか。",
        translation: "What can I bring for you?",
      },
      {
        id: "ordering-second",
        speaker: "learner",
        mode: "autoplay",
        japanese: "あ、ちょっと待ってください。",
        reading: "あ、ちょっとまってください。",
        translation: "Oh, give me a second.",
      },
      {
        id: "ordering-menu",
        speaker: "learner",
        mode: "autoplay",
        japanese: "メニューはどこですか。",
        reading: "めにゅーはどこですか。",
        translation: "Where is the menu?",
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
      },
    ],
  },
  {
    id: "meal",
    number: 2,
    title: "The meal",
    bubbles: [
      {
        id: "meal-arrives",
        speaker: "staff",
        mode: "autoplay",
        japanese: "お料理をお持ちしました。",
        reading: "おりょうりをおもちしました。",
        translation: "Here is the meal.",
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
};

export const FLOW: FlowBubble[] = STAGES.flatMap((stage) =>
  stage.bubbles.map((bubble) => ({
    ...bubble,
    stageId: stage.id,
    stageNumber: stage.number,
    stageTitle: stage.title,
  })),
);
