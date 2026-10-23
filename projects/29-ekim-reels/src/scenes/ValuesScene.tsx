import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Embers, Grain, LightLeak, Vignette } from "../components/Effects";
import { Photo } from "../components/Photo";
import { anton, C, clamp, easeOut, pl } from "../theme";
import { VALUES, VALUE_AT } from "../timeline";

const LINE_H = 160;

export const ValuesScene: React.FC = () => {
  const f = useCurrentFrame();
  const local = VALUE_AT.map((v) => v - 470);
  const active = local.reduce((acc, t, i) => (f >= t - 2 ? i : acc), 0);
  const drift = -active * 12;

  return (
    <AbsoluteFill style={{ backgroundColor: C.ground, overflow: "hidden" }}>
      <Photo
        src="img/crowd.jpg"
        span={249}
        scaleFrom={1.34}
        scaleTo={1.46}
        objectPosition="50% 74%"
        brightness={0.42}
        saturate={0.72}
        contrast={1.2}
        tint={0.6}
      />
      <AbsoluteFill
        style={{
          opacity: 0.62,
          background: "radial-gradient(58% 36% at 50% 44%, rgba(227,10,23,0.4) 0%, rgba(0,0,0,0) 74%)",
        }}
      />
      {/* keeps the type readable over the crowd */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(52% 40% at 50% 50%, rgba(4,3,5,0.62) 0%, rgba(4,3,5,0.34) 62%, rgba(4,3,5,0) 100%)",
        }}
      />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, transform: `translateY(${40 + drift}px)` }}>
          {VALUES.map((word, i) => {
            const at = local[i];
            const next = i + 1 < local.length ? local[i + 1] : at + 70;
            const reveal = interpolate(f, [at - 7, at + 4], [0, 1], { ...clamp, easing: easeOut });
            const isActive = f >= at && f < next;
            const isPast = f >= next;
            const hot = interpolate(f, [at - 7, at + 3, next, next + 10], [0, 1, 1, 0], clamp);
            const glow = isActive ? 0.95 : 0;
            return (
              <div key={word} style={{ height: LINE_H, overflow: "hidden", display: "flex", justifyContent: "center" }}>
                <div
                  style={{
                    fontFamily: anton,
                    fontSize: 156,
                    lineHeight: `${LINE_H}px`,
                    letterSpacing: "-0.015em",
                    color: C.white,
                    opacity: reveal * (isPast ? 0.3 : isActive ? 1 : 0.62),
                    transform: `translateY(${(1 - reveal) * 108}px) scale(${isPast ? 0.975 : 1})`,
                    textShadow: `0 0 ${70 * glow}px rgba(227,10,23,${0.85 * glow}), 0 6px 40px rgba(0,0,0,0.8)`,
                  }}
                >
                  {word}
                </div>
                <div
                  style={{
                    width: 4,
                    alignSelf: "center",
                    height: 96 * hot,
                    marginLeft: 26,
                    backgroundColor: C.red,
                    boxShadow: `0 0 26px rgba(227,10,23,${0.9 * hot})`,
                    opacity: hot,
                  }}
                />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      <Embers count={26} seed={131} warmth={0.4} />
      <LightLeak progress={pl(f, 0, 70) * 0.5} color="#FFB98A" opacity={0.35} angle={70} width={90} />
      <Vignette strength={1.05} />
      <Grain opacity={0.09} />
    </AbsoluteFill>
  );
};
