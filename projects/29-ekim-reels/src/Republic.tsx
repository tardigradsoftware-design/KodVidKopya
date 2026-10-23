import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fonts } from "./kit/theme";
import { video } from "./video";

const FPS = 30;
const VOICE_SECONDS = 27.384;
const TOTAL_SECONDS = 30;
const NARRATION = video.scenes.map((scene) => scene.say ?? "");
const allWords = NARRATION.flatMap((line) => line.split(/\s+/).filter(Boolean));
const charWeight = (word: string) => Math.max(1, word.replace(/[.,!?;:]/g, "").length + (/[,.;!?]$/.test(word) ? 2 : 0));
const totalWeight = allWords.reduce((sum, word) => sum + charWeight(word), 0);
const captions = (() => {
  let cursor = 0;
  return allWords.map((word) => {
    const start = cursor / totalWeight * VOICE_SECONDS;
    cursor += charWeight(word);
    return { word, start, end: cursor / totalWeight * VOICE_SECONDS };
  });
})();
const sceneWeights = NARRATION.map((line) => line.split(/\s+/).filter(Boolean).reduce((sum, word) => sum + charWeight(word), 0));
const timeline = (() => {
  let t = 0;
  return sceneWeights.map((weight) => {
    const start = t;
    t += weight / totalWeight * VOICE_SECONDS;
    return { start, end: t };
  });
})();
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const easeOut = Easing.bezier(0.7, 0, 0.84, 1);

const starPoints = (cx: number, cy: number, outer: number, inner: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? inner : outer;
    const a = -Math.PI / 2 + i * Math.PI / 5;
    return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
  }).join(" ");

/** Official 3:2 flag geometry, drawn as SVG rather than sourced imagery. */
const Flag = ({ style }: { style?: React.CSSProperties }) => (
  <svg viewBox="0 0 900 600" preserveAspectRatio="xMidYMid meet" style={style} role="img" aria-label="Dalgalanan Türk bayrağı">
    <defs>
      <linearGradient id="cloth" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#a90012" />
        <stop offset="0.24" stopColor="#ed1c24" />
        <stop offset="0.5" stopColor="#b70818" />
        <stop offset="0.77" stopColor="#ee1b25" />
        <stop offset="1" stopColor="#99000e" />
      </linearGradient>
      <linearGradient id="sheen" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.48" stopColor="#fff" stopOpacity="0.17" />
        <stop offset="0.65" stopColor="#26000a" stopOpacity="0.13" />
        <stop offset="0.83" stopColor="#fff" stopOpacity="0.08" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <filter id="cloth-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="18" />
      </filter>
    </defs>
    <rect width="900" height="600" fill="url(#cloth)" />
    <g fill="#fff">
      <circle cx="288" cy="300" r="171" />
      <circle cx="344" cy="300" r="137" fill="#c80d1d" />
      <polygon points={starPoints(465, 300, 87, 36)} />
    </g>
    <path d="M0 92 C170 64 210 142 365 110 S625 64 900 106 L900 190 C650 150 535 214 350 184 S118 160 0 190Z" fill="#fff" opacity=".055" />
    <path d="M0 390 C180 348 260 444 430 406 S700 340 900 392 L900 482 C706 448 546 505 370 470 S140 446 0 482Z" fill="#39000b" opacity=".14" />
    <rect width="900" height="600" fill="url(#sheen)" />
  </svg>
);

const FabricFlag: React.FC<{ top?: number; width?: number; opacity?: number; phase?: number }> = ({ top = 0, width = 1120, opacity = 1, phase = 0 }) => {
  const frame = useCurrentFrame();
  const flutter = Math.sin((frame + phase) / 16) * 2.6;
  const scaleX = 1 + Math.sin((frame + phase) / 24) * 0.022;
  return (
    <div style={{ position: "absolute", top, left: "50%", width, aspectRatio: "3 / 2", opacity, transform: `translateX(-50%) perspective(1500px) rotateY(${flutter}deg) scaleX(${scaleX})`, transformOrigin: "center" }}>
      <Flag style={{ width: "100%", height: "100%", filter: "drop-shadow(0 32px 66px rgba(15,0,0,.55))" }} />
    </div>
  );
};

const Vignette: React.FC<{ red?: boolean }> = ({ red }) => (
  <AbsoluteFill style={{ background: red ? "radial-gradient(ellipse at 50% 48%, transparent 20%, rgba(18,0,4,.18) 63%, rgba(4,0,2,.73) 100%)" : "radial-gradient(ellipse at 50% 45%, transparent 8%, rgba(0,0,0,.26) 58%, rgba(0,0,0,.82) 100%)", pointerEvents: "none" }} />
);

const Backdrop: React.FC<{ scene: number; local: number }> = ({ scene, local }) => {
  const zoom = 1.05 + 0.065 * Math.min(1, local / 8);
  const imgStyle: React.CSSProperties = { position: "absolute", width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`, filter: "saturate(1.06) contrast(1.09)" };
  if (scene === 0) return <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 52%, #31040d 0%, #11040a 34%, #030306 74%, #000 100%)" }} />;
  if (scene === 1) return <AbsoluteFill style={{ background: "linear-gradient(145deg, #9f0718 0%, #e30a17 45%, #760713 100%)" }} />;
  if (scene === 2) return <AbsoluteFill><Img src={staticFile("anitkabir.jpg")} style={imgStyle} /><AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,4,13,.22), rgba(13,2,6,.38) 45%, rgba(0,0,0,.72))" }} /></AbsoluteFill>;
  if (scene === 3) return <AbsoluteFill><Img src={staticFile("crowd.jpg")} style={{ ...imgStyle, filter: "saturate(1.08) contrast(1.1) brightness(.78)" }} /><AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(22,0,5,.42), rgba(62,0,6,.17) 48%, rgba(0,0,0,.68))" }} /></AbsoluteFill>;
  return <AbsoluteFill><Img src={staticFile("fireworks.jpg")} style={{ ...imgStyle, filter: "saturate(1.12) contrast(1.1) brightness(.78)" }} /><AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,4,15,.22), rgba(12,2,7,.12) 42%, rgba(0,0,0,.68))" }} /></AbsoluteFill>;
};

const YearCounter: React.FC<{ local: number; duration: number }> = ({ local, duration }) => {
  const year = Math.floor(interpolate(local, [0.25 * FPS, Math.max(0.26 * FPS, duration - 0.8 * FPS)], [1923, 2026], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const scale = interpolate(local, [0, 16, duration - 10, duration], [1.2, 1, 1.035, 1.16], { ...clamp, easing: ease });
  return (
    <>
      <div style={{ position: "absolute", top: 310, left: 0, right: 0, color: "rgba(255,255,255,.74)", fontFamily: fonts.sans, fontSize: 36, fontWeight: 500, textAlign: "center", letterSpacing: ".23em", textShadow: "0 2px 20px rgba(0,0,0,.65)" }}>CUMHURİYETİN YÜKSELİŞİ</div>
      <div style={{ position: "absolute", top: 390, left: 0, right: 0, color: "#fffaf5", fontFamily: fonts.sans, fontSize: 224, lineHeight: 1, fontWeight: 800, letterSpacing: "-.055em", textAlign: "center", transform: `scale(${scale})`, textShadow: "0 16px 70px rgba(0,0,0,.55)" }}>{year}</div>
      <div style={{ position: "absolute", top: 690, left: 120, right: 120, height: 3, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.72), transparent)" }} />
      <div style={{ position: "absolute", top: 730, left: 100, right: 100, textAlign: "center", color: "#fff", fontFamily: fonts.sans, fontSize: 49, lineHeight: 1.3, fontWeight: 500, textShadow: "0 4px 22px rgba(0,0,0,.7)" }}>Emekle, bilimle,<br />cesaretle ileri.</div>
      <FabricFlag top={1080} width={590} opacity={0.92} phase={48} />
    </>
  );
};

const WordValues: React.FC<{ local: number }> = ({ local }) => {
  const values = ["Özgürlük", "Eşitlik", "Laiklik", "Dayanışma"];
  const sceneStart = timeline[3].start * FPS;
  return <div style={{ position: "absolute", left: 70, right: 70, top: 375, bottom: 400, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 31, fontFamily: fonts.sans }}>
    {values.map((value, i) => {
      const spoken = captions.find((item) => item.word.toLocaleLowerCase("tr-TR").replace(/[.,!?;:]/g, "") === value.toLocaleLowerCase("tr-TR"));
      const start = spoken ? Math.max(0, spoken.start * FPS - sceneStart) : 14 + i * 18;
      const progress = interpolate(local, [start, start + 15], [0, 1], { ...clamp, easing: ease });
      return <div key={value} style={{ color: i === 0 || i === 3 ? "#fff8f4" : "#ffd1c9", fontSize: 88, lineHeight: 1.1, fontWeight: 800, letterSpacing: "-.035em", opacity: progress, transform: `translateX(${(1 - progress) * 280}px) scale(${0.87 + .13 * progress})`, textShadow: "0 8px 34px rgba(0,0,0,.52)" }}>{value}</div>;
    })}
  </div>;
};

const Content: React.FC<{ index: number; local: number; duration: number }> = ({ index, local, duration }) => {
  if (index === 0) {
    const reveal = interpolate(local, [0, 3, 10, 22], [0.72, 1.23, 1, 1.06], { ...clamp, easing: ease });
    const shake = interpolate(local, [0, 2, 5, 8], [0, -20, 11, 0], clamp);
    return <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", color: "#faf4ef", fontFamily: fonts.sans, fontWeight: 800, fontSize: 316, lineHeight: 1, letterSpacing: "-.07em", transform: `translateX(${shake}px) scale(${reveal})`, textShadow: "0 0 60px rgba(255,255,255,.18), 0 25px 90px rgba(0,0,0,.8)", WebkitTextStroke: "1px rgba(255,255,255,.3)" }}>1923</div>
      <div style={{ position: "absolute", top: 1015, left: 130, right: 130, height: 2, background: "linear-gradient(90deg,transparent,#ff4650,transparent)", transform: `scaleX(${interpolate(local, [5, 25], [0, 1], clamp)})` }} />
      <div style={{ position: "absolute", top: 1058, left: 0, right: 0, textAlign: "center", color: "rgba(255,245,242,.8)", fontFamily: fonts.sans, fontSize: 36, letterSpacing: ".34em", opacity: interpolate(local, [14, 30], [0, 1], clamp) }}>BİR MİLLETİN DÖNÜM NOKTASI</div>
    </>;
  }
  if (index === 1) {
    const opening = interpolate(local, [0, 24], [0.18, 1.03], { ...clamp, easing: ease });
    const title = interpolate(local, [14, 36], [0, 1], { ...clamp, easing: ease });
    return <>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,rgba(30,0,4,.26),transparent 50%,rgba(20,0,3,.22))" }} />
      <FabricFlag top={interpolate(local, [0, 30], [280, 460], { ...clamp, easing: ease })} width={1510 * opening} />
      <div style={{ position: "absolute", top: 1230, left: 90, right: 90, color: "white", fontFamily: fonts.sans, textAlign: "center", fontSize: 65, lineHeight: 1.16, fontWeight: 800, letterSpacing: "-.03em", opacity: title, transform: `translateY(${(1 - title) * 76}px)`, textShadow: "0 8px 36px rgba(52,0,6,.75)" }}>Bir millet,<br />kendi geleceğini seçti.</div>
    </>;
  }
  if (index === 2) return <YearCounter local={local} duration={duration} />;
  if (index === 3) return <>
    <div style={{ position: "absolute", top: 220, left: 0, right: 0, textAlign: "center", color: "rgba(255,248,242,.9)", fontFamily: fonts.sans, fontSize: 39, fontWeight: 500, letterSpacing: ".19em", textShadow: "0 3px 20px rgba(0,0,0,.8)" }}>CUMHURİYETİN DEĞERLERİ</div>
    <WordValues local={local} />
    <FabricFlag top={1070} width={410} opacity={interpolate(local, [duration - 55, duration - 22], [0.08, 0.8], clamp)} phase={9} />
  </>;
  const titleP = interpolate(local, [0, 22], [0, 1], { ...clamp, easing: ease });
  const settle = interpolate(local, [duration - 24, duration - 1], [1, 1.035], { ...clamp, easing: ease });
  return <>
    <div style={{ position: "absolute", top: 350, left: 45, right: 45, textAlign: "center", transform: `translateY(${(1 - titleP) * 200}px) scale(${settle})`, opacity: titleP, fontFamily: fonts.sans, textShadow: "0 8px 48px rgba(0,0,0,.76)" }}>
      <div style={{ color: "#fffaf5", fontSize: 93, lineHeight: 1.1, fontWeight: 500, letterSpacing: "-.035em" }}>Cumhuriyetimizin</div>
      <div style={{ color: "#fff", fontSize: 184, lineHeight: 1.02, fontWeight: 800, letterSpacing: "-.06em", marginTop: 18 }}>103. yılı</div>
      <div style={{ color: "#fffaf5", fontSize: 116, lineHeight: 1.1, fontWeight: 800, letterSpacing: "-.045em", marginTop: 12 }}>kutlu olsun!</div>
    </div>
    <div style={{ position: "absolute", top: 1000, left: 140, right: 140, height: 3, background: "linear-gradient(90deg,transparent,rgba(255,255,255,.85),transparent)", transform: `scaleX(${titleP})`, boxShadow: "0 0 36px #fff" }} />
    <div style={{ position: "absolute", top: 1060, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${interpolate(local, [0, 18], [0.4, 1], { ...clamp, easing: ease })})` }}><Flag style={{ width: 260, filter: "drop-shadow(0 12px 40px rgba(0,0,0,.6))" }} /></div>
  </>;
};

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const seconds = frame / FPS;
  const active = captions.findIndex((caption) => seconds >= caption.start && seconds < caption.end);
  if (active < 0) return null;
  let startIndex = active;
  while (startIndex > 0 && !/[.!?]$/.test(captions[startIndex - 1].word)) startIndex -= 1;
  let endIndex = active;
  while (endIndex < captions.length - 1 && !/[.!?]$/.test(captions[endIndex].word)) endIndex += 1;
  const words = captions.slice(startIndex, endIndex + 1);
  return <div style={{ position: "absolute", bottom: 210, left: 72, right: 72, zIndex: 20, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 13, rowGap: 8, padding: "17px 24px", background: "rgba(3,2,5,.38)", borderRadius: 14, fontFamily: fonts.sans, textAlign: "center", textShadow: "0 3px 14px rgba(0,0,0,.85)" }}>
    {words.map((item, i) => {
      const index = startIndex + i;
      const isCurrent = index === active;
      const already = index < active;
      return <span key={`${item.word}-${index}`} style={{ color: isCurrent ? "#ff454d" : already ? "rgba(255,255,255,.72)" : "#fff", fontSize: 46, lineHeight: 1.2, fontWeight: isCurrent ? 800 : 600, transform: isCurrent ? "scale(1.045)" : "scale(1)", display: "inline-block" }}>{item.word}</span>;
    })}
  </div>;
};

const SceneLayer: React.FC<{ index: number; start: number; end: number; frame: number }> = ({ index, start, end, frame }) => {
  const local = frame - start;
  const duration = end - start;
  const intro = interpolate(local, [0, 12], [230, 0], { ...clamp, easing: ease });
  const outro = interpolate(local, [duration - 12, duration], [0, -230], { ...clamp, easing: easeOut });
  const offset = frame < start + 12 ? intro : frame > end - 12 ? outro : 0;
  const imageMotion = interpolate(local, [0, duration], [1, 1.055], clamp);
  return <AbsoluteFill style={{ overflow: "hidden", transform: `translateX(${offset}px) scale(${imageMotion})`, transformOrigin: "center" }}>
    <Backdrop scene={index} local={local / FPS} />
    {index === 1 && <Vignette red />}
    {index === 0 && <Vignette />}
    <Content index={index} local={local} duration={duration} />
  </AbsoluteFill>;
};

const Fx: React.FC = () => {
  const timings = [
    { file: "stinger-energetic-hit.wav", second: 0.02, volume: 0.34 },
    { file: "impact-soft-1.wav", second: 0.03, volume: 0.60 },
    { file: "whoosh-short.wav", second: timeline[1].start, volume: 0.20 },
    { file: "whoosh-short.wav", second: timeline[2].start, volume: 0.18 },
    { file: "riser-medium-4s.wav", second: Math.max(0, timeline[2].start - 3.7), volume: 0.13 },
    { file: "whoosh-short.wav", second: timeline[3].start, volume: 0.17 },
    { file: "whoosh-short.wav", second: timeline[4].start, volume: 0.18 },
    { file: "stinger-energetic-hit.wav", second: timeline[4].start + 0.12, volume: 0.29 },
  ];
  return <>{timings.map((item, i) => <Sequence key={`${item.file}-${i}`} from={Math.max(0, Math.round(item.second * FPS))}><Audio src={staticFile(item.file)} volume={item.volume} /></Sequence>)}</>;
};

export const RepublicFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const totalFrames = TOTAL_SECONDS * FPS;
  const sceneFrames = timeline.map((t) => ({ start: Math.round(t.start * FPS), end: Math.round(t.end * FPS) }));
  sceneFrames[4].end = totalFrames;
  const particles = Array.from({ length: 78 }, (_, i) => {
    const burst = Math.floor(i / 26);
    const particle = i % 26;
    const burstStart = burst === 0 ? timeline[3].start + 0.6 : timeline[4].start + 0.18 + (burst - 1) * 1.15;
    const start = burstStart * FPS + (particle % 13) * 2;
    const age = frame - start;
    const angle = (particle * 2.399) % (Math.PI * 2);
    const radius = Math.max(0, age) * (1.3 + (particle % 5) * 0.35);
    const opacity = interpolate(age, [0, 8, 54], [0, 0.95, 0], clamp);
    const centerX = burst === 0 ? 50 : burst === 1 ? 30 : 71;
    const centerY = burst === 0 ? 39 : burst === 1 ? 29 : 42;
    return <div key={i} style={{ position: "absolute", left: `${centerX + Math.cos(angle) * (3 + (particle % 4) * 2)}%`, top: `${centerY + Math.sin(angle) * (3 + (particle % 4) * 2)}%`, width: 4 + particle % 4, height: 4 + particle % 4, borderRadius: "50%", background: particle % 3 ? "#ffdfb0" : "#ff3346", boxShadow: "0 0 22px 5px rgba(255,90,80,.55)", opacity, transform: `translate(${Math.cos(angle) * radius}px,${Math.sin(angle) * radius - age * 0.14}px)`, pointerEvents: "none" }} />;
  });
  return <AbsoluteFill style={{ backgroundColor: "#050208", width: 1080, height, overflow: "hidden" }}>
    {sceneFrames.map(({ start, end }, i) => frame >= start - 12 && frame < end + 1 ? <SceneLayer key={i} index={i} start={start} end={end} frame={frame} /> : null)}
    <AbsoluteFill style={{ pointerEvents: "none", background: "linear-gradient(90deg,rgba(0,0,0,.24),transparent 18%,transparent 82%,rgba(0,0,0,.2))" }} />
    {particles}
    <Captions />
    <Fx />
  </AbsoluteFill>;
};
