import type { VideoSpec } from "./kit/Film";

// Format: Mistakes (a 3-tips variant: the three tips are common mistakes). Niche: self-care. Style: fresh.
export const video: VideoSpec = {
  fps: 30,
  width: 1080,
  height: 1920,
  style: "fresh",
  voice: "voice.mp3",
  voiceSeconds: 18.26,
  captions: true,
  sfx: true,
  music: null,
  scenes: [
    { type: "hook", say: "Bakım rutininde en sık yapılan üç hata.", text: "Bakımda en sık yapılan 3 hata", highlight: "3" },
    { type: "tip", say: "Birincisi, her gün sert temizleyiciyle yıkamak.", number: 1, icon: "Droplets", title: "Sert temizleyici", detail: "Nazik bir ürün yeter" },
    { type: "tip", say: "İkincisi, aynı anda beş yeni ürün denemek.", number: 2, icon: "Layers", title: "Aynı anda çok ürün", detail: "Tek tek dene" },
    { type: "tip", say: "Üçüncüsü, bakımı sadece kötü bir günün ardından hatırlamak.", number: 3, icon: "Calendar", title: "Bakımı ertelemek", detail: "Düzen, üründen önce gelir", cut: "wipe" },
    { type: "statement", say: "Cildin hızlı sonuç değil, düzen ister.", text: "Cildin hızlı sonuç değil, düzen ister.", highlight: "düzen" },
    { type: "cta", say: "Kaydet, rutinini sadeleştir.", text: "Kaydet • Rutinini sadeleştir" },
  ],
};
