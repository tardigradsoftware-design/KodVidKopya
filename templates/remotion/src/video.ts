import type { VideoSpec } from "./kit/Film";

// THE ONLY FILE YOU NORMALLY EDIT.
// 1. Write the scenes and their `say` lines.
// 2. Generate the voice from narrationScript(video) in one call, save it as public/voice.mp3.
// 3. Measure its length and set voiceSeconds. Scene lengths follow automatically.
//
// Scene types: title, statement, list, chips, code, image, closing.
// Optional per scene: seconds (fixed length), cut: "slide" (default) | "wipe" | "light".
export const video: VideoSpec = {
  fps: 30,
  width: 1920,
  height: 1080,
  voice: null, // "voice.mp3" once the file is in public/
  voiceSeconds: null, // measured length, for example 14.2
  theme: { accent: "#5eead4" }, // colors as 6-digit hex; keys: ground, ink, muted, accent
  scenes: [
    { type: "title", say: "KodVid ile kodla video üretin.", title: "KodVid", subtitle: "Kodla video üretimi" },
    { type: "statement", say: "Her kare bir fonksiyon, her sahne bir bileşen.", text: "Her kare bir fonksiyon", highlight: "fonksiyon", cut: "light" },
    { type: "list", say: "Sahneleri seçin, metni yazın, gerisini bırakın.", title: "Üç adım", items: ["Sahneleri seç", "Metni yaz", "GitHub render etsin"] },
    { type: "code", say: "Tek bir dosya tüm videoyu tanımlar.", title: "Tek dosya", code: 'scenes: [\n  { type: "title", title: "KodVid" },\n  { type: "list", items: [...] },\n]' },
    { type: "chips", say: "Remotion, React ve TypeScript.", title: "Altyapı", chips: ["Remotion", "React", "TypeScript", "GitHub Actions"] },
    { type: "closing", say: "Fikirden videoya, dakikalar içinde.", title: "Fikirden videoya", line: "Dakikalar içinde" },
  ],
};
