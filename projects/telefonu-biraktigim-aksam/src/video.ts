import type { VideoSpec } from "./kit/Film";

// Format: Mini story (reels.md): hook, problem, turn, result, quote, cta. Niche: self-care. Style: soft.
export const video: VideoSpec = {
  fps: 30,
  width: 1080,
  height: 1920,
  style: "soft",
  voice: "voice.mp3",
  voiceSeconds: 20.51,
  captions: true,
  sfx: true,
  music: null,
  scenes: [
    { type: "hook", say: "Telefonu bıraktığım akşam, hiçbir şey kaçırmadım.", text: "Telefonu bıraktığım akşam", highlight: "bıraktığım" },
    { type: "statement", say: "Elimde telefon, kafamda yarının listesi, saatlerce aynı yerdeydim.", text: "Elimde telefon, kafamda yarının listesi.", highlight: "yarının listesi" },
    { type: "statement", say: "Sonra telefonu başka odaya bıraktım ve on dakika sadece oturdum.", text: "Telefonu başka odaya bıraktım.", highlight: "başka odaya" },
    { type: "statement", say: "O akşam ilk kez, yatağa gerçekten yorgun girdim.", text: "Yatağa gerçekten yorgun girdim.", highlight: "gerçekten yorgun", cut: "light" },
    { type: "quote", say: "Dinlenmek bir ödül değil, bir ihtiyaç.", quote: "Dinlenmek bir ödül değil, bir ihtiyaç." },
    { type: "cta", say: "Bunu bir arkadaşına gönder.", text: "Gönder • O da denesin", icons: ["Send", "Heart"] },
  ],
};
