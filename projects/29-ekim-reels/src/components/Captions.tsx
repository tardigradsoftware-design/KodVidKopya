import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, clamp, inter } from "../theme";
import { CUES } from "../timeline";

/** Bottom captions: the spoken sentence, lit word by word as it is said. */
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  // the values list and the closing title carry their words themselves
  const cue = CUES.find((c) => c.sentence <= 4 && frame >= c.start - 1 && frame < c.end + 1);
  if (!cue) return null;
  const show = Math.min(
    interpolate(frame, [cue.start - 1, cue.start + 3], [0, 1], clamp),
    interpolate(frame, [cue.end - 4, cue.end], [1, 0], clamp),
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none", justifyContent: "flex-end", alignItems: "center", paddingBottom: 250 }}>
      <div
        style={{
          maxWidth: 880,
          padding: "18px 34px 20px",
          borderRadius: 26,
          backgroundColor: "rgba(6,5,8,0.3)",
          backdropFilter: "blur(10px)",
          opacity: show,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: "0.3em",
          rowGap: 2,
          fontFamily: inter,
          fontSize: 44,
          fontWeight: 800,
          letterSpacing: "-0.012em",
          textAlign: "center",
          lineHeight: 1.28,
          textShadow: "0 2px 18px rgba(0,0,0,0.75)",
          transform: `translateY(${(1 - show) * 14}px)`,
        }}
      >
        {cue.words.map((w, i) => {
          const said = interpolate(frame, [w.start, w.start + 2], [0, 1], clamp);
          const past = frame >= w.end ? 1 : 0;
          const color = said > 0.5 ? C.white : `rgba(247,243,236,${0.34 + 0.26 * past})`;
          const glow = said > 0.5 ? "0 0 22px rgba(255,120,90,0.55)" : "none";
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                color,
                textShadow: `${glow}, 0 2px 18px rgba(0,0,0,0.75)`,
                transform: `translateY(${(1 - said) * 3}px)`,
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
