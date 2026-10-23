import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Embers, Flash, Grain, ShockRing, Vignette } from "../components/Effects";
import { Photo } from "../components/Photo";
import { anton, C, clamp, easeIn, easeOut, pl } from "../theme";

const HIT = 18;

export const Opening: React.FC = () => {
  const f = useCurrentFrame();

  const shake = f >= HIT && f < HIT + 15 ? 1 - (f - HIT) / 15 : 0;
  const sx = Math.sin(f * 5.3) * 11 * shake;
  const sy = Math.cos(f * 4.1) * 8 * shake;

  const opacity = f < HIT ? 0 : interpolate(f, [HIT, HIT + 2, 156, 172], [0, 1, 1, 0], clamp);
  const scale =
    f < HIT
      ? 3.4
      : f < HIT + 9
        ? interpolate(f, [HIT, HIT + 9], [3.4, 1], { ...clamp, easing: easeOut })
        : f < 140
          ? interpolate(f, [HIT + 9, 140], [1, 1.13], clamp)
          : interpolate(f, [140, 177], [1.13, 3.1], { ...clamp, easing: easeIn });

  const split = Math.max(0, 1 - (f - HIT) / 11) * (f >= HIT ? 1 : 0);
  const flash = f >= HIT && f < HIT + 11 ? 1 - (f - HIT) / 11 : 0;
  const photo = pl(f, 62, 96);
  const wash = pl(f, 146, 176);
  const rule = pl(f, HIT + 7, HIT + 21);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ground, overflow: "hidden" }}>
      <AbsoluteFill style={{ opacity: photo * 0.8 }}>
        <Photo
          src="img/anitkabir.jpg"
          span={115}
          scaleFrom={1.2}
          scaleTo={1.36}
          brightness={0.5}
          saturate={0.85}
          contrast={1.16}
          tint={0.45}
        />
      </AbsoluteFill>

      {/* the red world the cut will land in */}
      <AbsoluteFill
        style={{
          opacity: interpolate(f, [HIT, HIT + 30], [0, 0.34], clamp),
          background: "radial-gradient(60% 42% at 50% 48%, rgba(227,10,23,0.55) 0%, rgba(227,10,23,0) 72%)",
        }}
      />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            margin: "0 auto",
            height: 2,
            width: 520 * pl(f, 0, 15) * (1 - pl(f, HIT - 2, HIT + 2)),
            marginTop: -2,
            background: `linear-gradient(90deg, rgba(227,10,23,0), ${C.red} 30%, #FF7A5C 50%, ${C.red} 70%, rgba(227,10,23,0))`,
            boxShadow: "0 0 18px rgba(227,10,23,0.9)",
          }}
        />
        <div style={{ transform: `translate(${sx}px, ${sy}px)` }}>
          <div style={{ position: "relative", width: 0, height: 0 }}>
            {/* colour split, gone in a breath */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                fontFamily: anton,
                fontSize: 380,
                lineHeight: 1,
                color: "rgba(255,40,60,0.85)",
                letterSpacing: "-0.045em",
                transform: `translate(-50%, -50%) translateX(${-split * 22}px)`,
                opacity: opacity * 0.9,
                filter: "blur(1px)",
                whiteSpace: "nowrap",
              }}
            >
              1923
            </div>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                fontFamily: anton,
                fontSize: 380,
                lineHeight: 1,
                color: "rgba(80,220,255,0.75)",
                letterSpacing: "-0.045em",
                transform: `translate(-50%, -50%) translateX(${split * 26}px)`,
                opacity: opacity * 0.8,
                filter: "blur(1px)",
                whiteSpace: "nowrap",
              }}
            >
              1923
            </div>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                fontFamily: anton,
                fontSize: 380,
                lineHeight: 1,
                color: C.ink,
                letterSpacing: "-0.045em",
                transform: `translate(-50%, -50%) scale(${scale})`,
                opacity,
                textShadow: "0 0 90px rgba(227,10,23,0.5), 0 0 24px rgba(255,220,200,0.25)",
                whiteSpace: "nowrap",
              }}
            >
              1923
            </div>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 206,
                height: 7,
                width: 560 * rule,
                marginLeft: (-560 * rule) / 2,
                background: `linear-gradient(90deg, rgba(227,10,23,0), ${C.red} 18%, #FF6A55 50%, ${C.red} 82%, rgba(227,10,23,0))`,
                boxShadow: "0 0 26px rgba(227,10,23,0.85)",
                opacity: f >= HIT ? 1 - pl(f, 140, 156) : 0,
              }}
            />
          </div>
        </div>
      </AbsoluteFill>

      <Embers count={38} seed={7} warmth={0.85} />
      <ShockRing at={HIT} />
      <Flash amount={flash * 0.95} />

      <AbsoluteFill
        style={{
          opacity: wash,
          background: "linear-gradient(180deg, #8E0A12 0%, #E30A17 62%, #FF4A32 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: interpolate(f, [0, 30], [0.5, 0.12], clamp),
          background: "radial-gradient(70% 55% at 50% 50%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.85) 100%)",
        }}
      />
      <Vignette strength={0.9} />
      <Grain opacity={0.1} />
    </AbsoluteFill>
  );
};
