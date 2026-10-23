import type { VideoSpec } from "./kit/Film";

// Format: Before / after habit (reels.md). Niche: self-care. Style: fresh.
export const video: VideoSpec = {
  fps: 30,
  width: 1080,
  height: 1920,
  style: "fresh",
  voice: "voice.mp3",
  voiceSeconds: 20.51,
  captions: true,
  sfx: true,
  music: null,
  scenes: [
    { type: "hook", say: "Yatağa telefonla mı giriyorsun?", text: "Yatağa telefonla mı giriyorsun?", highlight: "telefonla" },
    { type: "statement", say: "Önce böyleydi: yatakta yarım saat kaydırma, sonra uykuya dalamama.", text: "Yatakta yarım saat kaydırma.", highlight: "kaydırma" },
    { type: "statement", say: "Sonra şöyle oldu: telefon şarjda, yatakta sadece kitap.", text: "Telefon şarjda, yatakta sadece kitap.", highlight: "sadece kitap", cut: "wipe" },
    {
      type: "list",
      say: "Şarjı odadan çıkar, yatmadan bir saat önce bırak, yerine bir kitap koy, ilk gece yirmi dakikayla başla.",
      title: "Nasıl başlanır",
      items: ["Şarjı odadan çıkar", "Bir saat önce bırak", "Yerine kitap koy", "Yirmi dakikayla başla"],
      icons: ["Plug", "Clock", "BookOpen", "Moon"],
    },
    { type: "cta", say: "Kaydet, bu gece dene.", text: "Kaydet • Bu gece dene" },
  ],
};
