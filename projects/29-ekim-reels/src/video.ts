import type { VideoSpec } from "./kit/Film";

export const video: VideoSpec = {
  fps: 30,
  width: 1080,
  height: 1920,
  voice: "voice.mp3",
  voiceSeconds: 27.384,
  theme: { ground: "#09050a", ink: "#fffaf5", muted: "#e8c7bd", accent: "#ed1c24" },
  scenes: [
    { type: "title", say: "Bin dokuz yüz yirmi üç.", title: "1923" },
    { type: "statement", say: "Bir millet, kendi geleceğini kurma iradesiyle Cumhuriyet'i seçti.", text: "Bir millet, Cumhuriyet'i seçti." },
    { type: "image", say: "Yıllar aktı; emek, bilim ve cesaretle ülkemiz yükseldi. Her kuşak, bu büyük mirası ileri taşıdı.", src: "anitkabir.jpg", caption: "Cumhuriyet yükseliyor" },
    { type: "statement", say: "Özgürlük, eşitlik, laiklik, dayanışma. Cumhuriyet, ortak umudumuz ve yarınlara sözümüzdür.", text: "Özgürlük. Eşitlik. Laiklik. Dayanışma." },
    { type: "closing", say: "Cumhuriyetimizin yüz üçüncü yılı kutlu olsun!", title: "Cumhuriyetimizin 103. yılı kutlu olsun!" },
  ],
};
