import type { VideoSpec } from "./kit/Film";

// Format: Checklist (reels.md). Niche: self-care. Style: soft.
export const video: VideoSpec = {
  fps: 30,
  width: 1080,
  height: 1920,
  style: "soft",
  voice: "voice.mp3",
  voiceSeconds: 15.70,
  captions: true,
  sfx: true,
  music: null,
  scenes: [
    { type: "hook", say: "Akşamları zihnin bir türlü susmuyor mu?", text: "Akşam zihnin susmuyor mu?", highlight: "susmuyor" },
    {
      type: "list",
      say: "Dört küçük şey dene: yarını üç maddeye indir, ekranı erken bırak, on dakika sessiz kal ve her gece aynı saatte yat.",
      title: "Akşam kapanış listesi",
      items: ["Yarını üç maddeye indir", "Ekranı erken bırak", "On dakika sessizlik", "Aynı saatte yat"],
      icons: ["PenLine", "Moon", "Headphones", "BedDouble"],
    },
    { type: "statement", say: "Zihnin, günün bittiğini bilmek ister.", text: "Zihnin, günün bittiğini bilmek ister.", highlight: "bittiğini" },
    { type: "cta", say: "Kaydet, bu akşam başla.", text: "Kaydet • Bu akşam başla" },
  ],
};
