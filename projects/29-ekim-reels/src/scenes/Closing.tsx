import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Burst, Embers, Flash, Grain, LightLeak, ShockRing, Vignette } from "../components/Effects";
import { Photo } from "../components/Photo";
import { anton, C, clamp, easeOut, pl } from "../theme";
import { CLOSING_WORDS, NICE_AT } from "../timeline";

const REVEAL = 12;

const MaskLine: React.FC<{
  readonly at: number;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ at, children, style }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [at, at + REVEAL], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div style={{ overflow: "hidden", display: "flex", justifyContent: "center", ...style }}>
      <div style={{ transform: `translateY(${(1 - t) * 104}%)`, opacity: t }}>{children}</div>
    </div>
  );
};

export const Closing: React.FC = () => {
  const f = useCurrentFrame();
  const w = CLOSING_WORDS.map((x) => x.start - 719);

  const nice = interpolate(f, [NICE_AT - 719 - 4, NICE_AT - 719 + 6], [0, 1], clamp);
  const mainAt = w[0] - 8;
  const numberAt = w[2] - 9;
  const tailAt = w[3] - 7;
  const hitFlash = f >= numberAt ? Math.max(0, 1 - (f - numberAt) / 12) : 0;
  const zoom = interpolate(f, [mainAt, 196], [1, 1.055], clamp);
  const pulse = 0.75 + 0.25 * Math.sin(f * 0.07);

  const litAt = (k: number) => interpolate(f, [w[k], w[k] + 4], [0.24, 1], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ground, overflow: "hidden" }}>
      <Photo
        src="img/flags-sunset.jpg"
        span={197}
        scaleFrom={1.06}
        scaleTo={1.26}
        shiftY={-20}
        brightness={0.64}
        saturate={1.06}
        contrast={1.12}
        objectPosition="50% 42%"
        tint={0.45}
      />
      <AbsoluteFill
        style={{
          background: "radial-gradient(60% 36% at 50% 52%, rgba(8,3,5,0.66) 0%, rgba(8,3,5,0.18) 58%, rgba(8,3,5,0.88) 100%)",
        }}
      />

      <Burst at={numberAt + 2} cx={250} cy={430} count={40} power={15} hue="255,190,120" />
      <Burst at={numberAt + 24} cx={880} cy={360} count={36} power={13} hue="255,150,120" />
      <Burst at={numberAt + 50} cx={560} cy={300} count={44} power={17} hue="255,214,160" />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `translateY(140px) scale(${zoom})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              fontFamily: anton,
              fontSize: 56,
              letterSpacing: "0.02em",
              color: C.gold,
              opacity: nice * 0.8,
              textShadow: "0 0 34px rgba(244,201,122,0.45)",
              marginBottom: 16,
            }}
          >
            NİCE YÜZYILLARA
          </div>

          <MaskLine at={mainAt} style={{ height: 96 }}>
            <div
              style={{
                fontFamily: anton,
                fontSize: 84,
                lineHeight: "96px",
                letterSpacing: "0.01em",
                color: C.ink,
                opacity: litAt(0),
                textShadow: `0 0 ${50 * pulse}px rgba(227,10,23,0.45), 0 6px 30px rgba(0,0,0,0.7)`,
              }}
            >
              CUMHURİYETİMİZİN
            </div>
          </MaskLine>

          <div style={{ height: 16 }} />

          <MaskLine at={numberAt} style={{ height: 320 }}>
            <div
              style={{
                fontFamily: anton,
                fontSize: 320,
                lineHeight: "320px",
                letterSpacing: "-0.02em",
                color: C.white,
                opacity: interpolate(f, [numberAt, numberAt + 6], [0.25, 1], clamp),
                textShadow: `0 0 110px rgba(227,10,23,0.9), 0 0 40px rgba(255,190,150,0.55)`,
              }}
            >
              103.
            </div>
          </MaskLine>

          <MaskLine at={tailAt} style={{ height: 104 }}>
            <div style={{ display: "flex", columnGap: 30, justifyContent: "center" }}>
              {["YILI", "KUTLU", "OLSUN!"].map((word, k) => (
                <span
                  key={word}
                  style={{
                    fontFamily: anton,
                    fontSize: 84,
                    lineHeight: "104px",
                    letterSpacing: "0.01em",
                    color: C.ink,
                    opacity: litAt(3 + k),
                    textShadow: `0 0 ${44 * pulse}px rgba(227,10,23,0.5), 0 6px 30px rgba(0,0,0,0.7)`,
                  }}
                >
                  {word}
                </span>
              ))}
            </div>
          </MaskLine>
        </div>
      </AbsoluteFill>

      <Embers count={40} seed={211} warmth={0.9} />
      <ShockRing at={numberAt + 1} />
      <Flash amount={hitFlash * 0.8} color="#FFF0DC" />
      <LightLeak
        progress={pl(f, 0, 60) * 0.6 + 0.4}
        color="#FFCFA0"
        opacity={pl(f, 0, 12) * 0.42}
        angle={68}
        width={85}
      />
      {/* a last sweep of light over the number, so the hold is not a still */}
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          opacity: 0.5 * interpolate(f, [118, 132, 168, 182], [0, 1, 1, 0], clamp),
          background: `linear-gradient(74deg, rgba(0,0,0,0) ${pl(f, 118, 182) * 100 - 30}%, rgba(255,232,205,0.5) ${pl(f, 118, 182) * 100}%, rgba(0,0,0,0) ${pl(f, 118, 182) * 100 + 26}%)`,
        }}
      />
      <Vignette strength={0.95} />
      <Grain opacity={0.085} />
    </AbsoluteFill>
  );
};
