import type { VideoSpec } from "./kit/Film";

export const video: VideoSpec = {
  fps: 30,
  width: 1920,
  height: 1080,
  voice: "voice.mp3",
  voiceSeconds: 26.44,
  theme: {
    ground: "#12080b",
    ink: "#faf5f5",
    muted: "#c9aeb2",
    accent: "#ef233c",
  },
  scenes: [
    {
      type: "title",
      say: "Yirmi dokuz Ekim bin dokuz yüz yirmi üçte yeni bir çağ başladı.",
      title: "29 Ekim",
      subtitle: "Cumhuriyet Bayramı",
      cut: "slide",
    },
    {
      type: "image",
      say: "Ankara'daki Meclis, milletin kaderini kendi iradesine emanet etti.",
      src: "ankara-1923.jpg",
      caption: "29 Ekim 1923, Ankara",
      cut: "light",
    },
    {
      type: "statement",
      say: "Egemenlik kayıtsız ve şartsız olarak millete verildi.",
      text: "Egemenlik kayıtsız şartsız milletindir",
      highlight: "milletindir",
      cut: "slide",
    },
    {
      type: "list",
      say: "Çağdaş hukuk, eğitim ve eşit yurttaşlık kök saldı.",
      title: "Cumhuriyetin temelleri",
      items: [
        "Ulusal egemenlik ilkesi",
        "Çağdaş hukuk ve eğitim",
        "Eşit ve özgür yurttaşlık",
      ],
      cut: "wipe",
    },
    {
      type: "chips",
      say: "Bilimle ve özgür düşünceyle bir asrı aştık.",
      title: "Yüz üç yıllık miras",
      chips: [
        "1923 Ankara",
        "Bağımsızlık",
        "Bilim ve Sanat",
        "Özgür İrade",
        "Çağdaş Türkiye",
      ],
      cut: "slide",
    },
    {
      type: "closing",
      say: "Yirmi dokuz Ekim Cumhuriyet Bayramımız kutlu olsun.",
      title: "29 Ekim Kutlu Olsun",
      line: "Cumhuriyet Bayramımız",
    },
  ],
};
