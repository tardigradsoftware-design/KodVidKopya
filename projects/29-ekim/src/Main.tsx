import { loadFont } from "@remotion/google-fonts/Inter";
import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { AbsoluteFill, Easing, interpolate, random, staticFile, useCurrentFrame } from "remotion";

const { fontFamily } = loadFont("normal", { weights: ["400", "800"], subsets: ["latin", "latin-ext"] });

const colors = { ink: "#f6f3ee", accent: "#e30a17", muted: "#a8a29b" };
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Night sky ground: warm dark gradient, drifting star dots, vignette.
const World: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(900px 700px at 50% 6%, rgba(227,10,23,0.15), transparent 65%)," +
          "radial-gradient(1000px 900px at 18% 96%, rgba(120,30,60,0.16), transparent 70%)," +
          "linear-gradient(180deg, #150a0e 0%, #0d0a12 60%, #0a0810 100%)",
        overflow: "hidden",
      }}
    >
      {new Array(34).fill(0).map((_, i) => {
        const x0 = random(`sx-${i}`) * 760;
        const y0 = random(`sy-${i}`) * 1240;
        const size = 2 + random(`ss-${i}`) * 4;
        const speed = 0.1 + random(`sv-${i}`) * 0.22;
        const x = ((((x0 - frame * speed) % 780) + 780) % 780) - 30;
        const o = 0.16 + random(`so-${i}`) * 0.38;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y0,
              width: size,
              height: size,
              borderRadius: "50%",
              background: colors.ink,
              opacity: o,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 48%, rgba(3,2,6,0.66) 100%)" }}
      />
    </AbsoluteFill>
  );
};

// Crescent and star, the flag motif, drawn as plain SVG.
const Emblem: React.FC<{
  readonly size: number;
  readonly crescentColor: string;
  readonly starColor: string;
  readonly opacity?: number;
}> = ({ size, crescentColor, starColor, opacity = 1 }) => (
  <svg width={size} height={size} viewBox="-100 -100 200 200" style={{ opacity }}>
    <defs>
      <mask id="crescentMask">
        <rect x={-100} y={-100} width={200} height={200} fill="white" />
        <circle cx={14} cy={0} r={62} fill="black" />
      </mask>
    </defs>
    <circle cx={-6} cy={0} r={72} fill={crescentColor} mask="url(#crescentMask)" />
    <polygon
      points="0,-1 0.2245,-0.309 0.9511,-0.309 0.3633,0.118 0.5878,0.809 0,0.382 -0.5878,0.809 -0.3633,0.118 -0.9511,-0.309 -0.2245,-0.309"
      transform="translate(56 0) scale(40)"
      fill={starColor}
    />
  </svg>
);

// Scene 1 - Hook: "29 Ekim", the hero year, then the line unmask-reveals with the voice.
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, 109], [1, 1.018], clamp);
  const titleScale = interpolate(frame, [0, 12], [1.3, 1], { ...clamp, easing: ease });
  const yearScale = interpolate(frame, [8, 22], [1.35, 1], { ...clamp, easing: ease });
  const yearY = interpolate(frame, [8, 22], [40, 0], { ...clamp, easing: ease });
  const yearOp = interpolate(frame, [8, 13], [0, 1], clamp);
  const beam = interpolate(frame, [16, 80], [470, -220], { ...clamp, easing: ease });
  const words = ["Cumhuriyet", "ilan", "edildi"];
  const starts = [23, 42, 56];

  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", fontFamily, scale: `${push}` }}
    >
      <div style={{ position: "absolute", top: 96, left: 430, opacity: 0.06 }}>
        <Emblem size={240} crescentColor={colors.ink} starColor={colors.ink} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <div style={{ position: "relative", scale: `${titleScale}` }}>
          <div style={{ fontSize: 110, fontWeight: 800, letterSpacing: "-0.03em", color: colors.ink, lineHeight: 1.05 }}>
            29 Ekim
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: -14,
              height: 5,
              borderRadius: 3,
              background: "rgba(246,243,238,0.16)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              bottom: -14,
              height: 5,
              width: 150,
              borderRadius: 3,
              opacity: beam > -210 ? 1 : 0,
              translate: `${beam}px 0px`,
              background: "linear-gradient(90deg, rgba(246,243,238,0.95) 0%, rgba(227,10,23,0.95) 55%, rgba(227,10,23,0) 100%)",
            }}
          />
        </div>
        <div
          style={{
            fontSize: 270,
            fontWeight: 800,
            letterSpacing: "-0.06em",
            color: colors.accent,
            lineHeight: 1,
            scale: `${yearScale}`,
            translate: `0px ${yearY}px`,
            opacity: yearOp,
          }}
        >
          1923
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 64, color: colors.muted, marginTop: 26 }}>
          {words.map((w, i) => {
            const p = interpolate(frame, [starts[i], starts[i] + 12], [130, 0], { ...clamp, easing: ease });
            return (
              <span key={w} style={{ display: "inline-block", overflow: "hidden", paddingBottom: 14 }}>
                <span style={{ display: "inline-block", translate: `${p}% 0px` }}>{w}</span>
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 2 - Proof: the founder's name lands with the voice, a red underline sweeps,
// then the journey line arrives as a caption for the spoken sentence.
const Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, 209], [1, 1.02], clamp);
  const l0x = interpolate(frame, [0, 12], [170, 0], { ...clamp, easing: ease });
  const l1x = interpolate(frame, [16, 30], [210, 0], { ...clamp, easing: ease });
  const l1Op = interpolate(frame, [14, 18], [0, 1], clamp);
  const subx = interpolate(frame, [46, 58], [130, 0], { ...clamp, easing: ease });
  const subOp = interpolate(frame, [44, 48], [0, 1], clamp);
  const underline = interpolate(frame, [66, 96], [0, 1], { ...clamp, easing: ease });
  const capY = interpolate(frame, [98, 110], [80, 0], { ...clamp, easing: ease });
  const capOp = interpolate(frame, [98, 104], [0, 1], clamp);

  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", paddingBottom: 340, fontFamily, scale: `${push}` }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: "-0.02em", color: colors.ink, translate: `${l0x}px 0px` }}>
          Mustafa Kemal
        </div>
        <div style={{ position: "relative", display: "inline-block", translate: `${l1x}px 0px`, opacity: l1Op }}>
          <div style={{ fontSize: 140, fontWeight: 800, letterSpacing: "-0.04em", color: colors.accent, lineHeight: 1.1 }}>
            Atatürk
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: -6,
              height: 7,
              borderRadius: 4,
              background: colors.accent,
              transformOrigin: "left center",
              scale: `${underline} 1`,
            }}
          />
        </div>
        <div style={{ fontSize: 60, fontWeight: 400, color: colors.muted, opacity: subOp, translate: `${subx}px 0px` }}>
          öncülüğünde kuruldu
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 48,
          bottom: 96,
          width: 624,
          boxSizing: "border-box",
          padding: "24px 30px",
          borderRadius: 14,
          background: "rgba(6,4,8,0.7)",
          border: "1px solid rgba(168,162,155,0.3)",
          fontSize: 64,
          lineHeight: 1.4,
          fontWeight: 400,
          color: colors.ink,
          opacity: capOp,
          translate: `0px ${capY}px`,
        }}
      >
        O günden bu yana aynı umutla yürüyoruz.
      </div>
    </AbsoluteFill>
  );
};

// Scene 3 - Closing: emblem, greeting lines land with their spoken words, then stillness.
const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, 113], [1, 1.03], clamp);
  const embScale = interpolate(frame, [0, 16], [1.4, 1], { ...clamp, easing: ease });
  const embOp = interpolate(frame, [0, 6], [0, 1], clamp);
  const lines = ["Cumhuriyet", "Bayramımız", "kutlu olsun!"];
  const starts = [2, 20, 46];
  const beam = interpolate(frame, [62, 96], [420, -200], { ...clamp, easing: ease });

  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", gap: 60, fontFamily, scale: `${push}` }}
    >
      <div style={{ scale: `${embScale}`, opacity: embOp }}>
        <Emblem size={210} crescentColor={colors.accent} starColor={colors.ink} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {lines.map((t, i) => {
          const x = interpolate(frame, [starts[i], starts[i] + 14], [150, 0], { ...clamp, easing: ease });
          const op = interpolate(frame, [starts[i], starts[i] + 4], [0, 1], clamp);
          return (
            <div key={t} style={{ position: "relative", display: "inline-block", opacity: op, translate: `${x}px 0px` }}>
              <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: "-0.03em", color: colors.ink, lineHeight: 1.14 }}>
                {t}
              </div>
              {i === 2 ? (
                <>
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: -16,
                      height: 5,
                      borderRadius: 3,
                      background: "rgba(246,243,238,0.16)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      bottom: -16,
                      height: 5,
                      width: 140,
                      borderRadius: 3,
                      opacity: beam > -190 ? 1 : 0,
                      translate: `${beam}px 0px`,
                      background:
                        "linear-gradient(90deg, rgba(246,243,238,0.95) 0%, rgba(227,10,23,0.95) 55%, rgba(227,10,23,0) 100%)",
                    }}
                  />
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Total length = 109 + 209 + 113 - 12 - 12 = 407 frames.
export const Main: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0a0f" }}>
      <World />
      <Audio src={staticFile("voice.mp3")} />
      <TransitionSeries>
        <TransitionSeries.Sequence name="Hook" durationInFrames={109}>
          <Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 12 })}
        />
        <TransitionSeries.Sequence name="Proof" durationInFrames={209}>
          <Proof />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 12 })}
        />
        <TransitionSeries.Sequence name="Closing" durationInFrames={113}>
          <Closing />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
