import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, clamp } from "../theme";

/** A photo plate with a slow camera move and a cinematic grade. */
export const Photo: React.FC<{
  readonly src: string;
  /** Length of the shot in frames; the move is spread across it. */
  readonly span?: number;
  readonly scaleFrom?: number;
  readonly scaleTo?: number;
  readonly shiftX?: number;
  readonly shiftY?: number;
  readonly brightness?: number;
  readonly saturate?: number;
  readonly contrast?: number;
  readonly objectPosition?: string;
  readonly tint?: number;
}> = ({
  src,
  span = 250,
  scaleFrom = 1.04,
  scaleTo = 1.16,
  shiftX = 0,
  shiftY = 0,
  brightness = 0.72,
  saturate = 0.9,
  contrast = 1.1,
  objectPosition = "50% 50%",
  tint = 0.28,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, span], [0, 1], clamp);
  const scale = scaleFrom + (scaleTo - scaleFrom) * t;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: C.ground }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translate(${shiftX * t}px, ${shiftY * t}px)`,
          filter: `brightness(${brightness}) saturate(${saturate}) contrast(${contrast})`,
        }}
      >
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition }} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: [
            `linear-gradient(180deg, rgba(4,4,6,0.82) 0%, rgba(4,4,6,0.15) 26%, rgba(4,4,6,0.1) 52%, rgba(4,4,6,0.86) 100%)`,
            `radial-gradient(90% 60% at 50% 58%, rgba(227,10,23,${(tint * 0.5).toFixed(3)}) 0%, rgba(4,4,6,0) 70%)`,
          ].join(", "),
        }}
      />
    </AbsoluteFill>
  );
};
