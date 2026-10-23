import type { VideoSpec } from "./kit/Film";

// Every scene cut (`seconds`) lands inside the measured inter-sentence breath pauses of public/voice.mp3,
// and `cuesMs` locks every word, list item, chip and headline transition to the narrator's exact vocal onsets.
export const video: VideoSpec = {
  fps: 30,
  width: 1920,
  height: 1080,
  voice: "voice.mp3",
  voiceSeconds: 26.44,
  subtitles: true,
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
      seconds: 4.1, // Cut slides 4.10s..4.50s inside acoustic silence [3.99s..4.67s]
      cuesMs: [180, 990, 1590, 3210], // "29" (180ms), "Ekim" (990ms), Rule ("1923te" 1590ms), Subtitle ("yeni bir çağ" 3210ms)
      title: "29 Ekim",
      subtitle: "1923 — Yeni Bir Çağ",
      cut: "slide",
    },
    {
      type: "image",
      say: "Ankara'daki Meclis, milletin kaderini kendi iradesine emanet etti.",
      seconds: 5.4, // Ends at 9.50s inside acoustic silence [9.10s..9.79s]
      cuesMs: [4670, 5050, 5400, 6260], // Caption words enter on "Ankara'daki Meclis, milletin..."
      src: "ankara-1923.jpg",
      caption: "29 Ekim 1923, Ankara",
      cut: "light",
    },
    {
      type: "statement",
      say: "Egemenlik kayıtsız ve şartsız olarak millete verildi.",
      seconds: 3.97, // Cut slides 13.47s..13.87s inside acoustic silence [13.42s..13.91s]
      cuesMs: [9790, 10750, 11560, 12500], // Exact vocal onsets: "Egemenlik" | "kayıtsız" | "şartsız" | "millete"
      text: "Egemenlik kayıtsız şartsız milletindir",
      highlight: "milletindir",
      cut: "slide",
    },
    {
      type: "list",
      say: "Çağdaş hukuk, eğitim ve eşit yurttaşlık kök saldı.",
      seconds: 4.26, // Cut wipes 17.73s..18.13s inside acoustic silence [17.71s..18.15s]
      cuesMs: [13910, 15100, 15880], // Exact vocal onsets: "Çağdaş hukuk" | "eğitim" | "eşit yurttaşlık"
      title: "Cumhuriyetin temelleri",
      items: [
        "Çağdaş hukuk düzeni",
        "Bilimsel ve yaygın eğitim",
        "Eşit ve özgür yurttaşlık",
      ],
      cut: "wipe",
    },
    {
      type: "chips",
      say: "Bilimle ve özgür düşünceyle bir asrı aştık.",
      seconds: 4.14, // Cut slides 21.87s..22.27s inside acoustic silence [21.62s..22.43s]
      cuesMs: [18150, 19360, 19950, 20770, 21310], // Exact vocal onsets across sentence 5
      title: "Yüz üç yıllık miras",
      chips: [
        "Bilim ve Sanat",
        "Özgür Düşünce",
        "Bağımsızlık",
        "1923 Ankara",
        "Çağdaş Türkiye",
      ],
      cut: "slide",
    },
    {
      type: "closing",
      say: "Yirmi dokuz Ekim Cumhuriyet Bayramımız kutlu olsun.",
      seconds: 4.53, // 21.87s..26.40s + 0.80s tail
      cuesMs: [22430, 23240, 23810, 25470], // "29" (22430ms), "Ekim" (23240ms), "Cumhuriyet Bayramımız" (23810ms), "Kutlu Olsun" (25470ms)
      title: "29 Ekim",
      line: "Cumhuriyet Bayramımız",
      subline: "Kutlu Olsun",
    },
  ],
};
