import type { ArtPackId } from "./art-packs.ts";
import {
  createFlow,
  type FlowBubble,
  type PracticeStage,
  type PracticeStory,
} from "../../shared/story.ts";

export const STORY = {
  id: "cafe-conversation",
  artPackId: "cafe",
  title: {
    ja: "喫茶店のひととき",
    en: "A moment at the café",
  },
} as const;

export const STAGES: PracticeStage[] = [
  {
    id: "ordering",
    number: 1,
    title: "Ordering",
    jpTitle: "ご注文",
    sceneId: "hall",
    castId: "server",
    transition: {
      id: "ordering-open",
      japanese: "昼下がりの喫茶店。ドアを開けると、コーヒーの香りがした。",
      reading:
        "ひるさがりのきっさてん。どあをあけると、こーひーのかおりがした。",
      translation:
        "Mid-afternoon at a coffee shop. You open the door, and the smell of coffee reaches you.",
      audioSrc: "/audio/qwen3/ordering-open.mp3",
    },
    bubbles: [
      {
        id: "ordering-welcome",
        speaker: "other",
        mode: "autoplay",
        japanese: "いらっしゃいませ。",
        reading: "いらっしゃいませ。",
        translation: "Welcome.",
        audioSrc: "/audio/qwen3/ordering-welcome.mp3",
      },
      {
        id: "ordering-question",
        speaker: "other",
        mode: "autoplay",
        japanese: "ご注文はお決まりですか。",
        reading: "ごちゅうもんはおきまりですか。",
        translation: "Are you ready to order?",
        audioSrc: "/audio/qwen3/ordering-question.mp3",
      },
      {
        id: "ordering-menu",
        speaker: "learner",
        mode: "speak",
        japanese: "メニューをお願いします。",
        reading: "めにゅーをおねがいします。",
        translation: "A menu, please.",
        audioSrc: "/audio/qwen3/ordering-menu.mp3",
        accepted: ["メニューお願いします", "メニューを見せてください"],
      },
      {
        id: "ordering-second",
        speaker: "other",
        mode: "autoplay",
        japanese: "本日のおすすめは、ブレンドコーヒーです。",
        reading: "ほんじつのおすすめは、ぶれんどこーひーです。",
        translation: "Today’s recommendation is the house blend.",
        audioSrc: "/audio/qwen3/ordering-second.mp3",
      },
      {
        id: "ordering-ready",
        speaker: "other",
        mode: "autoplay",
        japanese: "お決まりになりましたら、お呼びください。",
        reading: "おきまりになりましたら、およびください。",
        translation: "Please call me when you’re ready.",
        audioSrc: "/audio/qwen3/ordering-ready.mp3",
      },
      {
        id: "ordering-order",
        speaker: "learner",
        mode: "speak",
        japanese: "ブレンドコーヒーをお願いします。",
        reading: "ぶれんどこーひーをおねがいします。",
        translation: "The house blend, please.",
        audioSrc: "/audio/qwen3/ordering-order.mp3",
        accepted: ["コーヒーをお願いします", "ブレンドをお願いします"],
      },
      {
        id: "ordering-thanks",
        speaker: "other",
        mode: "autoplay",
        japanese: "ありがとうございます。",
        reading: "ありがとうございます。",
        translation: "Thank you.",
        audioSrc: "/audio/qwen3/ordering-thanks.mp3",
      },
    ],
  },
  {
    id: "meal",
    number: 2,
    title: "Payment",
    jpTitle: "お会計",
    sceneId: "register",
    castId: "server",
    transition: {
      id: "meal-open",
      japanese: "カップが空になった。あなたは伝票を持って、席を立った。",
      reading:
        "かっぷがからになった。あなたはでんぴょうをもって、せきをたった。",
      translation:
        "The cup is empty. You take the check and get up from your seat.",
      audioSrc: "/audio/qwen3/meal-open.mp3",
    },
    bubbles: [
      {
        id: "meal-arrives",
        speaker: "other",
        mode: "autoplay",
        japanese: "お会計は、レジでお願いします。",
        reading: "おかいけいは、れじでおねがいします。",
        translation: "Please pay at the register.",
        audioSrc: "/audio/qwen3/meal-arrives.mp3",
      },
      {
        id: "meal-restroom",
        speaker: "learner",
        mode: "speak",
        japanese: "レシートをお願いします。",
        reading: "れしーとをおねがいします。",
        translation: "A receipt, please.",
        audioSrc: "/audio/qwen3/meal-restroom.mp3",
        accepted: ["レシートください", "領収書をお願いします"],
      },
      {
        id: "meal-payment-options",
        speaker: "other",
        mode: "autoplay",
        japanese: "現金とカードが使えます。",
        reading: "げんきんとかーどがつかえます。",
        translation: "You can pay by cash or card.",
        audioSrc: "/audio/qwen3/meal-payment-options.mp3",
      },
      {
        id: "meal-serve",
        speaker: "learner",
        mode: "speak",
        japanese: "カードでお願いします。",
        reading: "かーどでおねがいします。",
        translation: "By card, please.",
        audioSrc: "/audio/qwen3/meal-serve.mp3",
        accepted: ["クレジットカードでお願いします", "カードで払います"],
      },
      {
        id: "meal-thanks",
        speaker: "other",
        mode: "autoplay",
        japanese: "ありがとうございました。",
        reading: "ありがとうございました。",
        translation: "Thank you very much.",
        audioSrc: "/audio/qwen3/meal-thanks.mp3",
      },
      {
        id: "meal-return",
        speaker: "other",
        mode: "autoplay",
        japanese: "またお越しくださいませ。",
        reading: "またおこしくださいませ。",
        translation: "Please come again.",
        audioSrc: "/audio/qwen3/meal-return.mp3",
      },
    ],
  },
];

export const FLOW: FlowBubble[] = createFlow(STAGES);

export const CAFE_STORY = {
  ...STORY,
  stages: STAGES,
  flow: FLOW,
} satisfies PracticeStory<ArtPackId>;
