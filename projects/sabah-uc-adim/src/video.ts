import type { VideoSpec } from "./kit/Film";

// Format: 3 tips (reels.md). Niche: self-care. Style: soft.
export const video: VideoSpec = {
  fps: 30,
  width: 1080,
  height: 1920,
  style: "soft",
  voice: "voice.mp3",
  voiceSeconds: 16.67,
  captions: true,
  sfx: true,
  music: null,
  scenes: [
    { type: "hook", say: "Sabahın hep acele mi geçiyor?", text: "Sabahın hep acele mi geçiyor?", highlight: "acele" },
    { type: "tip", say: "Uyanınca önce perdeyi aç, telefonu sonra eline al.", number: 1, icon: "Sun", title: "Önce perdeyi aç", detail: "Telefondan önce" },
    { type: "tip", say: "Bir bardak su iç, kahveyi ondan sonra düşün.", number: 2, icon: "GlassWater", title: "Bir bardak su", detail: "Kahveden önce" },
    { type: "tip", say: "Günün tek bir önceliğini yaz, gerisi bekleyebilir.", number: 3, icon: "PenLine", title: "Tek öncelik yaz", detail: "Gerisi bekleyebilir", cut: "wipe" },
    { type: "statement", say: "On dakika, bütün günün havasını değiştirir.", text: "On dakika, bütün günün havasını değiştirir.", highlight: "On dakika" },
    { type: "cta", say: "Kaydet, yarın sabah dene.", text: "Kaydet • Yarın sabah dene" },
  ],
};
