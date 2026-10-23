import { loadFont } from "@remotion/google-fonts/Inter";
import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { AbsoluteFill, Easing, interpolate, random, staticFile, useCurrentFrame } from "remotion";

const { fontFamily } = loadFont("normal", { weights: ["400", "800"], subsets: ["latin", "latin-ext"] });

const colors = { ground: "#0b1020", ink: "#eef2ff", accent: "#5eead4", muted: "#94a3b8" };
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const GLYPHS = ["{", "}", "<", ">", "/", ";", "=", "=>", "()", "[]", "#", "*"];
const mono = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

// The world the whole film lives in: one ground, drifting code glyphs, a vignette.
const World: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(1100px 700px at 28% 18%, rgba(94,234,212,0.10), transparent 60%)," +
          "radial-gradient(1500px 950px at 78% 88%, rgba(63,94,196,0.18), transparent 65%)," +
          "linear-gradient(180deg, #0b1020 0%, #0e1530 55%, #090d1a 100%)",
        overflow: "hidden",
      }}
    >
      {new Array(26).fill(0).map((_, i) => {
        const x0 = random(`gx-${i}`) * 2100;
        const y0 = random(`gy-${i}`) * 1010;
        const size = 24 + random(`gs-${i}`) * 22;
        const speed = 0.35 + random(`gv-${i}`) * 0.5;
        const x = ((((x0 - frame * speed) % 2200) + 2200) % 2200) - 140;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y0,
              fontFamily: mono,
              fontSize: size,
              color: colors.ink,
              opacity: 0.07,
            }}
          >
            {GLYPHS[Math.floor(random(`gc-${i}`) * GLYPHS.length)]}
          </div>
        );
      })}
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at 50% 48%, transparent 52%, rgba(4,6,14,0.6) 100%)" }}
      />
    </AbsoluteFill>
  );
};

// Scene 1 - Hook: the name lands oversized, the promise unmask-reveals word by word,
// an accent beam sweeps right to left (the film's direction) and keeps going.
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const words = ["kodla", "video", "üreten", "yapay", "zeka"];
  const scale = interpolate(frame, [0, 14], [1.3, 1], { ...clamp, easing: ease });
  const y = interpolate(frame, [0, 14], [52, 0], { ...clamp, easing: ease });
  const sweep = interpolate(frame, [14, 80], [880, -260], { ...clamp, easing: ease });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 58 }}>
        <div style={{ position: "relative", scale: `${scale}`, translate: `0px ${y}px` }}>
          <div style={{ fontSize: 240, fontWeight: 800, letterSpacing: "-0.05em", color: colors.ink, lineHeight: 1.05 }}>
            KodVid
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: -6,
              height: 6,
              borderRadius: 3,
              background: "rgba(238,242,255,0.14)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              bottom: -6,
              height: 6,
              width: 240,
              borderRadius: 3,
              translate: `${sweep}px 0px`,
              background:
                "linear-gradient(90deg, rgba(238,242,255,0.95) 0%, rgba(94,234,212,0.9) 45%, rgba(94,234,212,0) 100%)",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: 64, color: colors.muted, letterSpacing: "-0.01em" }}>
          {words.map((w, i) => {
            const start = 16 + i * 9;
            const p = interpolate(frame, [start, start + 10], [130, 0], { ...clamp, easing: ease });
            return (
              <span key={w} style={{ display: "inline-block", overflow: "hidden", paddingBottom: 16 }}>
                <span style={{ display: "inline-block", translate: `${p}% 0px` }}>{w}</span>
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 2 - Proof: code lines fly in on the left and become a running composition
// on the right; 3D, captions and an effect arrive on their spoken words.
const CODE_LINES: ReadonlyArray<{ readonly text: string; readonly at: number }> = [
  { text: "const sahne = () => (", at: 4 },
  { text: "  <KodVid>", at: 14 },
  { text: "    <Daire r={140} />", at: 24 },
  { text: "    <Hareket />", at: 36 },
  { text: "    <UcBoyut />", at: 88 },
  { text: "    <Altyazi />", at: 98 },
  { text: "    <Efekt parla />", at: 140 },
  { text: "  </KodVid>", at: 150 },
  { text: ")", at: 158 },
];

const STAGE = { left: 830, top: 150, width: 960, height: 740 };
const RING = { cx: 480, cy: 320, r: 190 };

const orbitPos = (f: number) => {
  const t = Math.max(f, 38) - 38;
  const a = ((-90 + t * 2.2) * Math.PI) / 180;
  return { x: RING.cx + 232 * Math.cos(a), y: RING.cy + 232 * Math.sin(a) };
};

const Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, 243], [1, 1.025], clamp);

  // Ring and disc rise when <Daire /> lands, then the arc keeps turning.
  const ringScale = interpolate(frame, [20, 38], [1.5, 1], { ...clamp, easing: ease });
  const ringOp = interpolate(frame, [20, 26], [0, 1], clamp);
  const discScale = interpolate(frame, [26, 42], [1.4, 1], { ...clamp, easing: ease });
  const discOp = interpolate(frame, [26, 32], [0, 1], clamp);
  const arcDeg = interpolate(frame, [38, 243], [0, 430], clamp);

  // Cube flies in before "üç boyut" is spoken and keeps rotating through the cut.
  const cubeX = interpolate(frame, [92, 106], [260, 0], { ...clamp, easing: ease });
  const cubeOp = interpolate(frame, [92, 98], [0, 1], clamp);
  const cubeSpin = (frame - 92) * 1.5 + 24;

  // Caption strip lands right before the sentence it transcribes.
  const stripY = interpolate(frame, [106, 118], [70, 0], { ...clamp, easing: ease });
  const stripOp = interpolate(frame, [106, 112], [0, 1], clamp);

  // One shine sweep across the stage on the word "efekt".
  const sweep = interpolate(frame, [156, 190], [-120, 240], clamp);

  const orbitMain = orbitPos(frame);
  const orbitG1 = orbitPos(frame - 5);
  const orbitG2 = orbitPos(frame - 10);
  const orbitOp = interpolate(frame, [35, 40], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ scale: `${push}` }}>
      {/* The code column */}
      <div style={{ position: "absolute", left: 110, top: 190, width: 680, fontFamily }}>
        {CODE_LINES.map((line, i) => {
          const p = interpolate(frame, [line.at, line.at + 12], [110, 0], { ...clamp, easing: ease });
          const hi = i === 2 ? interpolate(frame, [36, 46], [0, 1], { ...clamp, easing: ease }) : 0;
          return (
            <div key={line.text} style={{ position: "relative", height: 68, width: 660, overflow: "hidden" }}>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 44,
                  lineHeight: "68px",
                  color: colors.muted,
                  whiteSpace: "pre",
                  translate: `${p}% 0px`,
                }}
              >
                {line.text}
              </div>
              {i === 2 ? (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 6,
                    height: 4,
                    width: 540,
                    borderRadius: 2,
                    background: colors.accent,
                    transformOrigin: "left center",
                    scale: `${hi} 1`,
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      {/* The output stage: what the code becomes (clips the shine sweep) */}
      <div style={{ position: "absolute", ...STAGE, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: RING.cx - 300,
            top: RING.cy - 300,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(closest-side, rgba(94,234,212,0.13), transparent 78%)",
          }}
        />

        {/* Ring + rotating arc + disc (the <Daire /> output) */}
        <div
          style={{
            position: "absolute",
            left: RING.cx - RING.r,
            top: RING.cy - RING.r,
            width: RING.r * 2,
            height: RING.r * 2,
            scale: `${ringScale}`,
            opacity: ringOp,
          }}
        >
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "8px solid rgba(94,234,212,0.30)" }} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "8px solid transparent",
              borderTopColor: colors.accent,
              rotate: `${arcDeg}deg`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 50,
              borderRadius: "50%",
              border: "2px solid rgba(238,242,255,0.35)",
              background: "radial-gradient(circle at 40% 35%, rgba(94,234,212,0.22), rgba(94,234,212,0.04) 70%)",
              scale: `${discScale}`,
              opacity: discOp,
            }}
          />
        </div>

        {/* The <Hareket /> output: an orbiting square with a short trail */}
        {[
          { p: orbitG2, o: 0.12 * orbitOp },
          { p: orbitG1, o: 0.3 * orbitOp },
          { p: orbitMain, o: orbitOp },
        ].map((g, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 52,
              height: 52,
              borderRadius: 10,
              background: colors.accent,
              boxShadow: i === 2 ? "0 0 26px rgba(94,234,212,0.65)" : "none",
              opacity: g.o,
              translate: `${g.p.x - 26}px ${g.p.y - 26}px`,
            }}
          />
        ))}

        {/* The <UcBoyut /> output: a wireframe stack spinning in 3D */}
        <div
          style={{
            position: "absolute",
            left: 690,
            top: 30,
            width: 200,
            height: 200,
            perspective: 1100,
            opacity: cubeOp,
            translate: `${cubeX}px 0px`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `rotateX(58deg) rotateY(${cubeSpin}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            {[200, 140, 84].map((s, i) => (
              <div
                key={s}
                style={{
                  position: "absolute",
                  left: (200 - s) / 2,
                  top: (200 - s) / 2,
                  width: s,
                  height: s,
                  borderRadius: 8,
                  border: `4px solid rgba(94,234,212,${0.9 - i * 0.22})`,
                  rotate: `${i * 14}deg`,
                }}
              />
            ))}
          </div>
        </div>

        {/* The <Altyazi /> output: a caption strip for the spoken line */}
        <div
          style={{
            position: "absolute",
            left: 50,
            bottom: 24,
            width: 860,
            boxSizing: "border-box",
            padding: "20px 32px",
            borderRadius: 12,
            background: "rgba(4,6,14,0.72)",
            border: "1px solid rgba(148,163,184,0.30)",
            fontFamily,
            fontSize: 44,
            lineHeight: 1.45,
            color: colors.ink,
            opacity: stripOp,
            translate: `0px ${stripY}px`,
          }}
        >
          Üç boyut, altyazı, efekt; hepsi koddan gelir.
        </div>

        {/* The <Efekt parla /> output: one shine sweep over the stage */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "46%",
            height: "100%",
            mixBlendMode: "screen",
            translate: `${sweep}% 0px`,
            background:
              "linear-gradient(100deg, rgba(94,234,212,0) 0%, rgba(238,255,251,0.34) 45%, rgba(94,234,212,0.16) 62%, rgba(94,234,212,0) 100%)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Scene 3 - Ready: push, render, the finished video. Ends on designed stillness.
const Ready: React.FC = () => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, 128], [1, 1.03], clamp);
  const cmdX = interpolate(frame, [0, 14], [240, 0], { ...clamp, easing: ease });
  const rowX = interpolate(frame, [16, 28], [140, 0], { ...clamp, easing: ease });
  const ringP = interpolate(frame, [24, 62], [0, 1], { ...clamp, easing: ease });
  const thumbOp = interpolate(frame, [46, 52], [0, 1], clamp);
  const thumbScale = interpolate(frame, [50, 66], [1.35, 1], { ...clamp, easing: ease });
  const thumbY = interpolate(frame, [50, 66], [46, 0], { ...clamp, easing: ease });
  const readyOp = interpolate(frame, [52, 56], [0, 1], clamp);
  const readyX = interpolate(frame, [56, 68], [110, 0], { ...clamp, easing: ease });
  const playScale = interpolate(frame, [60, 72], [0.5, 1], { ...clamp, easing: ease });
  const playOp = interpolate(frame, [60, 66], [0, 1], clamp);
  const beam = interpolate(frame, [76, 104], [360, -180], { ...clamp, easing: ease });
  const beamOp = interpolate(frame, [74, 78, 94, 102], [0, 1, 1, 0], clamp);
  const C = 2 * Math.PI * 88;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 52, fontFamily, scale: `${push}` }}>
      <div
        style={{
          fontFamily: mono,
          fontSize: 56,
          color: colors.ink,
          background: "rgba(9,13,26,0.85)",
          border: "1px solid rgba(148,163,184,0.28)",
          borderRadius: 16,
          padding: "26px 44px",
          translate: `${cmdX}px 0px`,
        }}
      >
        <span style={{ color: colors.accent }}>❯ </span>git push origin main
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 44, translate: `${rowX}px 0px` }}>
        <svg width={200} height={200} viewBox="0 0 200 200">
          <circle cx={100} cy={100} r={88} fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth={10} />
          <circle
            cx={100}
            cy={100}
            r={88}
            fill="none"
            stroke={colors.accent}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - ringP)}
            transform="rotate(-90 100 100)"
          />
        </svg>
        <div style={{ fontSize: 58, fontWeight: 800, letterSpacing: "-0.02em", color: colors.ink }}>
          GitHub render eder
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 52 }}>
        <div
          style={{
            width: 300,
            height: 300,
            borderRadius: "50%",
            border: "4px solid rgba(94,234,212,0.9)",
            background: "radial-gradient(circle at 38% 32%, rgba(94,234,212,0.30), rgba(11,16,32,0.92) 68%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: thumbOp,
            scale: `${thumbScale}`,
            translate: `0px ${thumbY}px`,
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "58px solid #eef2ff",
              borderTop: "36px solid transparent",
              borderBottom: "36px solid transparent",
              marginLeft: 16,
              opacity: playOp,
              scale: `${playScale}`,
            }}
          />
        </div>
        <div
          style={{
            position: "relative",
            fontSize: 84,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: colors.ink,
            opacity: readyOp,
            translate: `${readyX}px 0px`,
          }}
        >
          video hazır
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: -18,
              height: 5,
              borderRadius: 3,
              background: "rgba(238,242,255,0.14)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              bottom: -18,
              height: 5,
              width: 150,
              borderRadius: 3,
              opacity: beamOp,
              translate: `${beam}px 0px`,
              background:
                "linear-gradient(90deg, rgba(238,242,255,0.95) 0%, rgba(94,234,212,0.9) 45%, rgba(94,234,212,0) 100%)",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Total length = sum of Sequence durations minus Transition durations: 102 + 243 + 129 - 12 - 12 = 450.
export const Main: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground }}>
      <World />
      <Audio src={staticFile("voice.mp3")} />
      <TransitionSeries>
        <TransitionSeries.Sequence name="Hook" durationInFrames={102}>
          <Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 12 })}
        />
        <TransitionSeries.Sequence name="Proof" durationInFrames={243}>
          <Proof />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 12 })}
        />
        <TransitionSeries.Sequence name="Ready" durationInFrames={129}>
          <Ready />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
