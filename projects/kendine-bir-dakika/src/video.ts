import type { VideoSpec } from "./kit/Film";

// Format: Quote of the day (reels.md). Niche: self-care. Style: soft.
// The quote is my own line, so it has no author.
export const video: VideoSpec = {
  fps: 30,
  width: 1080,
  height: 1920,
  style: "soft",
  voice: "voice.mp3",
  voiceSeconds: 15.39,
  captions: true,
  sfx: true,
  music: null,
  scenes: [
    { type: "image", say: "Şu an, sadece bir dakikan olsun.", src: "sessizlik.jpg", title: "Bir dakika" },
    { type: "quote", say: "Kendine ayırdığın bir dakika, günün en sessiz yeridir.", quote: "Kendine ayırdığın bir dakika, günün en sessiz yeridir." },
    { type: "statement", say: "Telefonu bırak, derin bir nefes al, omuzlarını indir.", text: "Telefonu bırak, nefes al, omuzlarını indir.", highlight: "nefes al" },
    { type: "statement", say: "Kimseye bir şey kanıtlamana gerek yok.", text: "Kimseye bir şey kanıtlamana gerek yok.", highlight: "kanıtlamana" },
    { type: "cta", say: "Kaydet, bir dakikan olduğunda aç.", text: "Kaydet • Bir dakikan olduğunda aç" },
  ],
};
