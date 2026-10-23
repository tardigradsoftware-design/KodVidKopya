import type { VideoSpec } from "./kit/Film";

// Format: Myth vs fact (reels.md) — no numbers, so no `fact` scene without a source. Niche: self-care. Style: bold.
export const video: VideoSpec = {
  fps: 30,
  width: 1080,
  height: 1920,
  style: "bold",
  voice: "voice.mp3",
  voiceSeconds: 16.04,
  captions: true,
  sfx: true,
  music: null,
  scenes: [
    { type: "hook", say: "Kendine zaman ayırmak bencillik mi, gerçekten?", text: "Kendine zaman ayırmak bencillik mi?", highlight: "bencillik" },
    { type: "statement", say: "Sana hep böyle söylendi: iyi olmak için önce herkese yetişmelisin.", text: "Önce herkese yetiş, en son sen.", highlight: "en son sen" },
    { type: "statement", say: "Ama boş bir bardaktan kimseye su veremezsin.", text: "Boş bir bardaktan kimseye su veremezsin.", highlight: "Boş", cut: "light" },
    { type: "statement", say: "Kendine ayırdığın on dakika, kimsenin hakkını almıyor.", text: "On dakika, kimsenin hakkını almıyor.", highlight: "kimsenin hakkını" },
    { type: "cta", say: "Bunu bir arkadaşına gönder.", text: "Gönder • O da duysun", icons: ["Send", "Heart"] },
  ],
};
