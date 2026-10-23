import type { VideoSpec } from "./kit/Film";

export const video: VideoSpec = {
  fps: 30,
  width: 1920,
  height: 1080,
  voice: "voice.mp3",
  voiceSeconds: 15.888,
  theme: { ground: "#080b18", ink: "#f8fafc", muted: "#a7b4cc", accent: "#5eead4" },
  scenes: [
    {
      type: "title",
      say: "KodVid, yapay zekâyla koddan video üretir.",
      title: "KodVid",
      subtitle: "Kodla video üretimi",
    },
    {
      type: "statement",
      say: "Fikrinizi sahnelere, metninizi anlatıma dönüştürün.",
      text: "Fikirden sahneye",
      highlight: "sahneye",
    },
    {
      type: "statement",
      say: "Türkçe seslendirme videonuza eşlik eder.",
      text: "Türkçe seslendirme",
      highlight: "seslendirme",
    },
    {
      type: "chips",
      say: "Remotion sahneleri birleştirir, GitHub render alır.",
      title: "Otomatik üretim",
      chips: ["Remotion", "React", "GitHub Actions"],
    },
    {
      type: "closing",
      say: "Fikrinizi paylaşın.",
      title: "Fikrinizi paylaşın",
      line: "Koddan videoya, hızlıca",
    },
  ],
};
