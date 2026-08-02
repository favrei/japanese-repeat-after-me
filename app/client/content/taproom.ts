import {
  createFlow,
  type PracticeStage,
  type PracticeStory,
} from "../../shared/story.ts";
import type { ArtPackId } from "./art-packs.ts";

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
      japanese:
        "夜のタップルーム。ドアを開けると、黒板いっぱいにビールの名前が並んでいた。",
      reading:
        "よるのたっぷるーむ。どあをあけると、こくばんいっぱいにびーるのなまえがならんでいた。",
      translation:
        "A taproom at night. You open the door, and the board is covered edge to edge with the names of beers.",
      audioSrc: "/audio/taproom/taproom-choose-open.mp3",
    },
    bubbles: [
      {
        id: "taproom-choose-welcome",
        speaker: "other",
        mode: "autoplay",
        japanese: "いらっしゃいませ。ご注文はお決まりですか。",
        reading: "いらっしゃいませ。ごちゅうもんはおきまりですか。",
        translation: "Welcome. Have you decided what you'd like?",
        audioSrc: "/audio/taproom/taproom-choose-welcome.mp3",
      },
      {
        id: "taproom-choose-firsttime",
        speaker: "learner",
        mode: "speak",
        japanese: "あの、初めてなんです。",
        reading: "あの、はじめてなんです。",
        translation: "Um — it's my first time here.",
        audioSrc: "/audio/taproom/taproom-choose-firsttime.mp3",
        accepted: ["初めてなんです", "初めてです", "あの、初めてです"],
      },
      {
        id: "taproom-choose-board",
        speaker: "other",
        mode: "autoplay",
        japanese: "ごゆっくりどうぞ。本日のビールはこちらのボードにございます。",
        reading:
          "ごゆっくりどうぞ。ほんじつのびーるはこちらのぼーどにございます。",
        translation: "Take your time. Today's beers are on the board here.",
        audioSrc: "/audio/taproom/taproom-choose-board.mp3",
      },
      {
        id: "taproom-choose-recommend",
        speaker: "learner",
        mode: "speak",
        japanese: "おすすめはどれですか。",
        reading: "おすすめはどれですか。",
        translation: "Which one do you recommend?",
        audioSrc: "/audio/taproom/taproom-choose-recommend.mp3",
        accepted: [
          "どれがおすすめですか",
          "おすすめはなんですか",
          "おすすめはどれでしょうか",
        ],
      },
      {
        id: "taproom-choose-two",
        speaker: "other",
        mode: "autoplay",
        japanese: "おすすめは、ペールエールと黒ビールです。",
        reading: "おすすめは、ぺーるえーるとくろびーるです。",
        translation: "The recommendations are the pale ale and the dark beer.",
        audioSrc: "/audio/taproom/taproom-choose-two.mp3",
      },
      {
        id: "taproom-choose-bitter",
        speaker: "other",
        mode: "autoplay",
        japanese: "ペールエールは苦みが少なくて、飲みやすいですよ。",
        reading: "ぺーるえーるはにがみがすくなくて、のみやすいですよ。",
        translation: "The pale ale isn't very bitter, so it's easy to drink.",
        audioSrc: "/audio/taproom/taproom-choose-bitter.mp3",
      },
      {
        id: "taproom-choose-order",
        speaker: "learner",
        mode: "speak",
        japanese: "じゃあ、ペールエールをお願いします。",
        reading: "じゃあ、ぺーるえーるをおねがいします。",
        translation: "I'll have the pale ale, then.",
        audioSrc: "/audio/taproom/taproom-choose-order.mp3",
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
      reading:
        "たっぷからびーるがそそがれ、しろいあわがしずかにたちあがった。",
      translation:
        "Beer runs from the tap, and a white head rises quietly.",
      audioSrc: "/audio/taproom/taproom-glass-open.mp3",
    },
    bubbles: [
      {
        id: "taproom-glass-served",
        speaker: "other",
        mode: "autoplay",
        japanese: "お待たせしました。こちらどうぞ。",
        reading: "おまたせしました。こちらどうぞ。",
        translation: "Thanks for waiting — here you are.",
        audioSrc: "/audio/taproom/taproom-glass-served.mp3",
      },
      {
        id: "taproom-glass-thanks",
        speaker: "learner",
        mode: "autoplay",
        japanese: "ありがとうございます。",
        reading: "ありがとうございます。",
        translation: "Thank you.",
        audioSrc: "/audio/taproom/taproom-glass-thanks.mp3",
      },
      {
        id: "taproom-glass-pay",
        speaker: "learner",
        mode: "speak",
        japanese: "お会計は今ですか。",
        reading: "おかいけいはいまですか。",
        translation: "Do I pay now?",
        audioSrc: "/audio/taproom/taproom-glass-pay.mp3",
        accepted: [
          "会計は今ですか",
          "今お会計ですか",
          "お会計は今でいいですか",
          "お会計は先ですか",
        ],
      },
      {
        id: "taproom-glass-later",
        speaker: "other",
        mode: "autoplay",
        japanese: "お会計は最後にまとめてお願いします。",
        reading: "おかいけいはさいごにまとめておねがいします。",
        translation: "You can settle up all together at the end.",
        audioSrc: "/audio/taproom/taproom-glass-later.mp3",
      },
      {
        id: "taproom-glass-here",
        speaker: "learner",
        mode: "speak",
        japanese: "ここで飲んでもいいですか。",
        reading: "ここでのんでもいいですか。",
        translation: "Is it all right to drink here?",
        audioSrc: "/audio/taproom/taproom-glass-here.mp3",
        accepted: [
          "ここで飲んでいいですか",
          "ここでもいいですか",
          "ここで大丈夫ですか",
        ],
      },
      {
        id: "taproom-glass-counter",
        speaker: "other",
        mode: "autoplay",
        japanese:
          "そちらのカウンターをご自由にお使いください。ごゆっくりどうぞ。",
        reading:
          "そちらのかうんたーをごじゆうにおつかいください。ごゆっくりどうぞ。",
        translation: "Feel free to use the counter over there. Enjoy.",
        audioSrc: "/audio/taproom/taproom-glass-counter.mp3",
      },
    ],
  },
];

const TAPROOM_FLOW = createFlow(TAPROOM_STAGES);

export const TAPROOM_STORY = {
  id: "taproom-first-glass",
  artPackId: "taproom",
  title: {
    ja: "初めての一杯",
    en: "The first glass",
  },
  stages: TAPROOM_STAGES,
  flow: TAPROOM_FLOW,
} satisfies PracticeStory<ArtPackId>;
