import { createTikTokStyleCaptions } from "@remotion/captions";
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { VOICE_CAPTIONS, voiceAmpAtFrame } from "../audioSync";
import { clamp, easeIn, easeOut, fonts, Theme } from "./theme";

// Broadcast-grade word-synced subtitle bar driven by millisecond timestamps and live vocal amplitude.
export const Subtitles: React.FC<{ readonly theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = (frame / fps) * 1000;
  const amp = voiceAmpAtFrame(frame);

  const pages = useMemo(() => {
    const { pages: raw } = createTikTokStyleCaptions({
      captions: VOICE_CAPTIONS,
      combineTokensWithinMilliseconds: 4500,
    });
    return raw.map((page, idx) => {
      const lastToken = page.tokens[page.tokens.length - 1];
      const nextStart = raw[idx + 1] ? raw[idx + 1].startMs - 20 : Infinity;
      const naturalEnd = (lastToken ? lastToken.toMs : page.startMs) + 180;
      const endMs = Math.max(page.startMs + 160, Math.min(nextStart, naturalEnd));
      return { ...page, endMs };
    });
  }, []);

  const activePage = pages.find((p) => nowMs >= p.startMs - 45 && nowMs < p.endMs);
  if (!activePage) {
    return null;
  }

  const enterOpacity = interpolate(nowMs, [activePage.startMs - 45, activePage.startMs + 65], [0, 1], clamp);
  const exitOpacity = interpolate(nowMs, [activePage.endMs - 110, activePage.endMs], [1, 0], clamp);
  const pillOpacity = Math.min(enterOpacity, exitOpacity);

  const enterY = interpolate(nowMs, [activePage.startMs - 45, activePage.startMs + 95], [14, 0], {
    ...clamp,
    easing: easeIn,
  });
  const exitY = interpolate(nowMs, [activePage.endMs - 110, activePage.endMs], [0, 8], {
    ...clamp,
    easing: easeOut,
  });

  const eqHeights = [
    6 + 18 * voiceAmpAtFrame(frame - 2),
    8 + 22 * amp,
    7 + 19 * voiceAmpAtFrame(frame + 1),
    5 + 15 * voiceAmpAtFrame(frame + 2),
  ];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 42,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          maxWidth: 1560,
          padding: "13px 28px 13px 22px",
          borderRadius: 999,
          backgroundColor: "rgba(12, 5, 8, 0.84)",
          border: `1.5px solid rgba(239, 35, 60, ${(0.28 + 0.42 * amp).toFixed(3)})`,
          boxShadow: `0 12px 34px rgba(0, 0, 0, 0.58), 0 0 ${Math.round(14 + 18 * amp)}px rgba(239, 35, 60, ${(0.12 + 0.2 * amp).toFixed(3)})`,
          opacity: pillOpacity,
          translate: `0px ${(enterY + exitY).toFixed(2)}px`,
          fontFamily: fonts.sans,
        }}
      >
        {/* Live deterministic 4-bar voice waveform meter */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            height: 28,
            paddingRight: 4,
            flexShrink: 0,
          }}
        >
          {eqHeights.map((h, idx) => (
            <div
              key={idx}
              style={{
                width: 4,
                height: Math.round(h),
                borderRadius: 99,
                backgroundColor: theme.accent,
                opacity: 0.65 + 0.35 * amp,
              }}
            />
          ))}
        </div>

        {/* Word-by-word voice-highlighted subtitle tokens */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            columnGap: 6,
            rowGap: 4,
          }}
        >
          {activePage.tokens.map((token, idx) => {
            const label = token.text.trim();
            const isActive = nowMs >= token.fromMs - 25 && nowMs <= token.toMs + 65;
            const isSpoken = nowMs > token.toMs + 65;
            const arrive = interpolate(nowMs, [token.fromMs - 35, token.fromMs + 75], [0, 1], {
              ...clamp,
              easing: easeIn,
            });
            const wordScale = isActive ? 1 + 0.05 * arrive + 0.025 * amp : 1;
            const wordY = isActive ? -2 * arrive : isSpoken ? 0 : 2;

            return (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  padding: "4px 11px",
                  borderRadius: 12,
                  fontSize: 38,
                  fontWeight: isActive ? 800 : 700,
                  letterSpacing: "-0.015em",
                  lineHeight: 1.2,
                  color: isActive ? "#ffffff" : isSpoken ? theme.ink : "rgba(250, 245, 245, 0.44)",
                  backgroundColor: isActive ? theme.accent : "transparent",
                  boxShadow: isActive ? `0 4px 18px rgba(239, 35, 60, ${(0.36 + 0.28 * amp).toFixed(3)})` : "none",
                  scale: `${wordScale.toFixed(3)}`,
                  translate: `0px ${wordY.toFixed(2)}px`,
                }}
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
