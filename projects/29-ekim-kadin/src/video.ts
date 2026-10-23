import type { VideoSpec } from "./kit/Film";

// 29 Ekim 2026: "Cumhuriyet ve kadın: 103 yılda kazanılan haklar"
// Kitle: 18-55 yaş kadınlar. Duygu: gurur, minnet, coşku.
// Yıllar (1930, 1934) "fact" yerine "title" sahnesiyle: sayaç tr-TR biçiminde "1.930" gösterirdi.
export const video: VideoSpec = {
  fps: 30,
  width: 1080,
  height: 1920,
  style: "bold",
  theme: { ground: "#1a0507", ground2: "#5c0a10", accent: "#e30a17", accent2: "#ffffff" },
  voice: null, // seslendirme üretilince: "voice.mp3"
  voiceSeconds: null, // ölçülen süre
  captions: true,
  sfx: true,
  music: null,
  scenes: [
    {
      type: "hook",
      say: "Bugün sahip olduğun hakların bir doğum günü var.",
      text: "Bugün sahip olduğun hakların bir doğum günü var.",
      highlight: "doğum günü",
    },
    {
      type: "fact",
      say: "29 Ekim 1923'te Cumhuriyet ilan edildi. Bu yıl tam 103 yaşında.",
      value: 103,
      suffix: " yıl",
      text: "29 Ekim 1923'te Cumhuriyet ilan edildi",
    },
    {
      type: "title",
      say: "1930'da kadınlar belediye seçimlerinde seçme ve seçilme hakkı kazandı.",
      title: "1930",
      subtitle: "Belediye seçimlerinde seçme ve seçilme hakkı",
    },
    {
      type: "title",
      say: "5 Aralık 1934'te milletvekili seçme ve seçilme hakkı geldi.",
      title: "5 Aralık 1934",
      subtitle: "Milletvekili seçme ve seçilme hakkı",
    },
    {
      type: "fact",
      say: "1935 seçimlerinde 18 kadın milletvekili Meclis'e girdi.",
      value: 18,
      suffix: " kadın",
      text: "1935 seçimlerinde Meclis'e giren kadın milletvekili",
    },
    {
      type: "image",
      say: "Bu haklar bize Cumhuriyetin armağanı.",
      src: "tr.svg",
      title: "Cumhuriyetin armağanı",
      cut: "light",
    },
    {
      type: "closing",
      say: "Cumhuriyetimizin 103. yılı kutlu olsun!",
      title: "Cumhuriyetimizin 103. yılı kutlu olsun!",
      line: "29 Ekim 1923 – 2026",
    },
  ],
};
