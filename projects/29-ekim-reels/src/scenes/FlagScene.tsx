import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Embers, Grain, LightLeak, Vignette } from "../components/Effects";
import { Flag } from "../components/Flag";
import { C, clamp, easeIn, easeOut, mix } from "../theme";

export const FlagScene: React.FC = () => {
  const f = useCurrentFrame();
  const span = 147;

  const t = interpolate(f, [0, span], [0, 1], { ...clamp, easing: easeOut });
  const cx = mix(810, 730, t);
  const cy = mix(516, 494, t);
  const scale = mix(1.05, 0.935, t - 0.02 * Math.sin(t * 3));
  const rot = mix(-3.4, -1.1, t);
  const gust = 0.35 + 0.5 * t + 0.35 * Math.sin(f * 0.05);

  // at the very end the cloth whips right and the frame goes to light: the cut lands on motion
  const whip = interpolate(f, [span - 16, span], [0, 1], { ...clamp, easing: easeIn });
  const cam = {
    cx: cx - whip * 120,
    cy,
    scale: scale * (1 + whip * 0.05),
    rot: rot - whip * 2.2,
    phase: 1.6 - f * 0.145,
    gust: gust + whip * 1.4,
  };

  const sweep = interpolate(f, [4, 96], [-0.35, 1.25], clamp);
  // the cloth unfurls from the middle outward
  const open = interpolate(f, [0, 9], [0, 1], { ...clamp, easing: easeOut });
  const inset = (1 - open) * 50;
  const leak = interpolate(f, [span - 26, span - 2], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: C.deepRed, overflow: "hidden" }}>
      <AbsoluteFill style={{ clipPath: `inset(0% ${inset.toFixed(2)}% 0% ${inset.toFixed(2)}%)` }}>
        <Flag cam={cam} />
      </AbsoluteFill>

      {/* light travelling across the cloth */}
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          opacity: 0.5,
          background: `linear-gradient(66deg, rgba(0,0,0,0) ${sweep * 100 - 26}%, rgba(255,226,196,0.55) ${sweep * 100}%, rgba(0,0,0,0) ${sweep * 100 + 22}%)`,
        }}
      />
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          opacity: 0.35,
          background: "radial-gradient(70% 50% at 18% 18%, rgba(255,150,110,0.5) 0%, rgba(0,0,0,0) 60%)",
        }}
      />

      <Embers count={30} seed={41} warmth={0.5} />

      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, rgba(5,3,5,0.34) 0%, rgba(5,3,5,0) 24%, rgba(5,3,5,0) 66%, rgba(5,3,5,0.5) 100%)",
        }}
      />
      <Vignette strength={0.78} />
      <LightLeak progress={0.5 + whip * 0.5} color="#FFF0DA" opacity={leak * 0.95} angle={64} width={80} />
      <Grain opacity={0.09} />
    </AbsoluteFill>
  );
};
