import type { VideoSpec } from "./kit/Film";

// THE ONLY FILE YOU NORMALLY EDIT.
// 1. Write the scenes and one `say` sentence per scene.
// 2. Generate the voice from all `say` lines joined, in one call, save it as public/voice.mp3.
// 3. Measure its length and set voice and voiceSeconds. Scene lengths follow automatically.
//
// Scene types: hook, title, tip, quote, fact, statement, list, chips, code, image, cta, closing.
// Optional per scene: seconds (fixed length), cut: "slide" (default) | "wipe" | "light" (once per video).
// Icons are Lucide names: https://lucide.dev/icons (for example Sun, Moon, Coffee, Heart, Leaf, Droplets, Sparkles).
export const video: VideoSpec = {
  fps: 30,
  width: 1080, // vertical Reels / TikTok / Shorts. Use 1920 x 1080 for YouTube.
  height: 1920,
  style: "soft", // "soft" | "bold" | "fresh" | "dark"
  voice: null, // "voice.mp3" once the file is in public/
  voiceSeconds: null, // measured length, for example 24.6
  captions: true,
  sfx: true,
  music: null, // for Instagram, add music in the app instead
  scenes: [
    { type: "hook", say: "Sabahların daha güzel geçsin mi?", text: "Sabahların daha güzel geçsin mi?", highlight: "güzel" },
    { type: "tip", say: "Uyanınca önce bir bardak su iç.", number: 1, icon: "GlassWater", title: "Önce bir bardak su", detail: "Telefondan önce" },
    { type: "tip", say: "Beş dakika gün ışığına çık.", number: 2, icon: "Sun", title: "5 dakika gün ışığı" },
    { type: "tip", say: "Günün tek önceliğini yaz.", number: 3, icon: "PenLine", title: "Tek öncelik yaz", cut: "light" },
    { type: "quote", say: "Küçük adımlar, büyük değişimler getirir.", quote: "Küçük adımlar, büyük değişimler getirir." },
    { type: "cta", say: "Kaydet, yarın sabah dene.", text: "Kaydet • Yarın sabah dene" },
  ],
};
