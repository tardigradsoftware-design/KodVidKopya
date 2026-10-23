import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { voiceAmpAtFrame } from "../audioSync";
import { Rise, Rule, Words } from "./parts";
import { clamp, easeIn, fonts, size, Theme } from "./theme";

// Bottom padding reserves clean safe space above the animated subtitle bar.
const frameStyle: React.CSSProperties = {
  alignItems: "center",
  justifyContent: "center",
  padding: "80px 120px 156px",
  gap: 32,
  fontFamily: fonts.sans,
  textAlign: "center",
};

type SyncProps = {
  readonly theme: Theme;
  readonly sceneStartMs?: number;
  readonly cuesMs?: readonly number[];
};

const useSceneVoice = (sceneStartMs = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const globalMs = sceneStartMs + (frame / fps) * 1000;
  const globalFrame = Math.round((globalMs / 1000) * fps);
  const amp = voiceAmpAtFrame(globalFrame);
  const toLocal = (ms: number) => Math.max(0, ((ms - sceneStartMs) / 1000) * fps);
  return { frame, fps, globalMs, amp, toLocal };
};

export type TitleProps = { readonly title: string; readonly subtitle?: string };
export const TitleScene: React.FC<TitleProps & SyncProps> = ({ title, subtitle, theme, sceneStartMs = 0, cuesMs }) => {
  const { amp, toLocal } = useSceneVoice(sceneStartMs);
  const titleWords = title.split(/\s+/).filter(Boolean);
  const wordCues = cuesMs ? titleWords.map((_, i) => toLocal(cuesMs[i] ?? sceneStartMs + i * 200)) : undefined;
  const ruleDelay = cuesMs && cuesMs[titleWords.length] !== undefined ? toLocal(cuesMs[titleWords.length]) : 12;
  const subDelay = cuesMs && cuesMs[titleWords.length + 1] !== undefined ? toLocal(cuesMs[titleWords.length + 1]) : 18;

  return (
    <AbsoluteFill style={frameStyle}>
      <Words
        text={title}
        cuesLocalFrames={wordCues}
        style={{
          color: theme.ink,
          fontSize: size.hero,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 1.04,
          textShadow: `0 8px 36px rgba(239, 35, 60, ${(0.12 + 0.22 * amp).toFixed(3)})`,
        }}
      />
      <Rule theme={theme} delay={ruleDelay} duration={24} width={260} amp={amp} />
      {subtitle ? (
        <Rise delay={subDelay}>
          <div style={{ color: theme.muted, fontSize: size.body, fontWeight: 500 }}>{subtitle}</div>
        </Rise>
      ) : null}
    </AbsoluteFill>
  );
};

export type StatementProps = { readonly text: string; readonly highlight?: string };
export const StatementScene: React.FC<StatementProps & SyncProps> = ({ text, highlight, theme, sceneStartMs = 0, cuesMs }) => {
  const { frame, globalMs, amp, toLocal } = useSceneVoice(sceneStartMs);
  const marked = new Set((highlight ?? "").toLowerCase().split(/\s+/).filter(Boolean));
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <AbsoluteFill style={frameStyle}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: "0.28em",
          rowGap: "0.14em",
          maxWidth: 1500,
          fontSize: size.headline,
        }}
      >
        {words.map((w, i) => {
          const cueMs = cuesMs?.[i];
          const nextCueMs = cuesMs?.[i + 1] ?? (cueMs !== undefined ? cueMs + 950 : undefined);
          const s = cueMs !== undefined ? toLocal(cueMs) : i * 6;
          const isMarked = marked.has(w.toLowerCase().replace(/[.,!?;:]/g, ""));
          const isSpeakingWord = cueMs !== undefined && nextCueMs !== undefined && globalMs >= cueMs - 20 && globalMs < nextCueMs;
          const lift = isSpeakingWord ? -5 * (0.5 + 0.5 * amp) : 0;
          const entryY = interpolate(frame, [s, s + 11], [38, 0], { ...clamp, easing: easeIn });
          const entryScale = interpolate(frame, [s, s + 11], [1.22, 1], { ...clamp, easing: easeIn });

          return (
            <span
              key={i}
              style={{
                position: "relative",
                display: "inline-block",
                color: isMarked ? theme.accent : theme.ink,
                fontSize: size.headline,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.16,
                opacity: interpolate(frame, [s, s + 6], [0, 1], clamp),
                translate: `0px ${(entryY + lift).toFixed(2)}px`,
                scale: `${(entryScale * (isSpeakingWord ? 1 + 0.03 * amp : 1)).toFixed(3)}`,
                textShadow: isMarked
                  ? `0 6px 28px rgba(239, 35, 60, ${(0.28 + 0.32 * amp).toFixed(3)})`
                  : isSpeakingWord
                    ? `0 4px 20px rgba(255, 255, 255, ${(0.18 + 0.2 * amp).toFixed(3)})`
                    : "none",
              }}
            >
              {w}
              {isMarked ? (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: -6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: theme.accent,
                    transformOrigin: "left center",
                    scale: `${interpolate(frame, [s + 2, s + 18], [0, 1], { ...clamp, easing: easeIn })} 1`,
                  }}
                />
              ) : null}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export type ListProps = { readonly title: string; readonly items: string[] };
export const ListScene: React.FC<ListProps & SyncProps> = ({ title, items, theme, sceneStartMs = 0, cuesMs }) => {
  const { frame, globalMs, amp, toLocal } = useSceneVoice(sceneStartMs);
  const sliced = items.slice(0, 5);

  return (
    <AbsoluteFill style={{ ...frameStyle, alignItems: "center" }}>
      <Words text={title} delay={2} gap={3} style={{ color: theme.ink, fontSize: size.headline - 6, fontWeight: 800, letterSpacing: "-0.03em" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-start", marginTop: 8 }}>
        {sliced.map((item, i) => {
          const cueMs = cuesMs?.[i];
          const nextCueMs = cuesMs?.[i + 1] ?? (cueMs !== undefined ? cueMs + 1300 : undefined);
          const s = cueMs !== undefined ? toLocal(cueMs) : 12 + i * 9;
          const isSpeakingItem = cueMs !== undefined && nextCueMs !== undefined && globalMs >= cueMs - 30 && globalMs < nextCueMs;
          const dotWidth = isSpeakingItem ? 32 : 14;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                color: isSpeakingItem ? "#ffffff" : theme.ink,
                fontSize: size.body,
                fontWeight: isSpeakingItem ? 700 : 500,
                opacity: interpolate(frame, [s, s + 7], [0, 1], clamp),
                translate: interpolate(frame, [s, s + 13], ["84px 0px", "0px 0px"], { ...clamp, easing: easeIn }),
              }}
            >
              <div
                style={{
                  width: dotWidth,
                  height: 14,
                  borderRadius: 99,
                  backgroundColor: theme.accent,
                  boxShadow: isSpeakingItem ? `0 0 ${Math.round(16 + 14 * amp)}px ${theme.accent}` : "none",
                  flexShrink: 0,
                }}
              />
              {item}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export type ChipsProps = { readonly title?: string; readonly chips: string[] };
export const ChipsScene: React.FC<ChipsProps & SyncProps> = ({ title, chips, theme, sceneStartMs = 0, cuesMs }) => {
  const { frame, globalMs, amp, toLocal } = useSceneVoice(sceneStartMs);
  const sliced = chips.slice(0, 6);

  return (
    <AbsoluteFill style={frameStyle}>
      {title ? <Words text={title} delay={2} gap={3} style={{ color: theme.ink, fontSize: size.headline - 4, fontWeight: 800, letterSpacing: "-0.03em" }} /> : null}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 22, maxWidth: 1500 }}>
        {sliced.map((c, i) => {
          const cueMs = cuesMs?.[i];
          const nextCueMs = cuesMs?.[i + 1] ?? (cueMs !== undefined ? cueMs + 700 : undefined);
          const s = cueMs !== undefined ? toLocal(cueMs) : 8 + i * 5;
          const isSpeakingChip = cueMs !== undefined && nextCueMs !== undefined && globalMs >= cueMs - 25 && globalMs < nextCueMs;
          const baseScale = interpolate(frame, [s, s + 11], [1.26, 1], { ...clamp, easing: easeIn });

          return (
            <div
              key={i}
              style={{
                color: isSpeakingChip ? "#ffffff" : theme.ink,
                fontSize: size.small,
                fontWeight: isSpeakingChip ? 700 : 500,
                padding: "16px 36px",
                backgroundColor: isSpeakingChip ? "rgba(239, 35, 60, 0.24)" : "rgba(255, 255, 255, 0.03)",
                border: `2px solid ${theme.accent}`,
                boxShadow: isSpeakingChip ? `0 6px 24px rgba(239, 35, 60, ${(0.28 + 0.26 * amp).toFixed(3)})` : "none",
                borderRadius: 999,
                opacity: interpolate(frame, [s, s + 6], [0, 1], clamp),
                scale: `${(baseScale * (isSpeakingChip ? 1 + 0.03 * amp : 1)).toFixed(3)}`,
              }}
            >
              {c}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export type CodeProps = { readonly title?: string; readonly code: string };
export const CodeScene: React.FC<CodeProps & SyncProps> = ({ title, code, theme }) => {
  const frame = useCurrentFrame();
  const lines = code.replace(/\t/g, "  ").split("\n").slice(0, 10);
  return (
    <AbsoluteFill style={frameStyle}>
      {title ? <Words text={title} gap={3} style={{ color: theme.ink, fontSize: size.body + 12, fontWeight: 800 }} /> : null}
      <div
        style={{
          textAlign: "left",
          fontFamily: fonts.mono,
          fontSize: size.code,
          lineHeight: 1.5,
          color: theme.ink,
          backgroundColor: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 24,
          padding: "40px 56px",
          minWidth: 1100,
          maxWidth: 1500,
        }}
      >
        {lines.map((l, i) => {
          const s = 10 + i * 5;
          return (
            <div
              key={i}
              style={{
                whiteSpace: "pre",
                opacity: interpolate(frame, [s, s + 6], [0, 1], clamp),
                translate: interpolate(frame, [s, s + 10], ["24px 0px", "0px 0px"], { ...clamp, easing: easeIn }),
              }}
            >
              <span style={{ color: theme.muted, marginRight: 32 }}>{String(i + 1).padStart(2, " ")}</span>
              {l || " "}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export type ImageProps = { readonly src: string; readonly caption?: string };
export const ImageScene: React.FC<ImageProps & SyncProps> = ({ src, caption, theme, sceneStartMs = 0, cuesMs }) => {
  const { frame, amp, toLocal } = useSceneVoice(sceneStartMs);
  const url = /^https?:\/\//.test(src) ? src : staticFile(src);
  const captionWords = (caption ?? "").split(/\s+/).filter(Boolean);
  const wordCues = cuesMs ? captionWords.map((_, i) => toLocal(cuesMs[i] ?? sceneStartMs + 300 + i * 220)) : undefined;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ scale: interpolate(frame, [0, 165], [1.12, 1.02], { ...clamp, easing: easeIn }) }}>
        <Img src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(transparent 46%, rgba(8, 3, 5, 0.84) 100%)" }} />
      {caption ? (
        <AbsoluteFill
          style={{
            ...frameStyle,
            justifyContent: "flex-end",
            paddingBottom: 158,
            gap: 14,
          }}
        >
          <Words
            text={caption}
            delay={8}
            cuesLocalFrames={wordCues}
            style={{
              color: theme.ink,
              fontSize: size.body + 6,
              fontWeight: 800,
              textShadow: "0 4px 24px rgba(0,0,0,0.75)",
            }}
          />
          <Rule theme={theme} delay={wordCues?.[captionWords.length - 1] ?? 16} duration={18} width={180} amp={amp} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export type ClosingProps = { readonly title: string; readonly line?: string; readonly subline?: string };
export const ClosingScene: React.FC<ClosingProps & SyncProps> = ({ title, line, subline, theme, sceneStartMs = 0, cuesMs }) => {
  const { amp, toLocal } = useSceneVoice(sceneStartMs);
  const titleWords = title.split(/\s+/).filter(Boolean);
  const wordCues = cuesMs ? titleWords.map((_, i) => toLocal(cuesMs[i] ?? sceneStartMs + 200 + i * 240)) : undefined;
  const lineDelay = cuesMs && cuesMs[titleWords.length] !== undefined ? toLocal(cuesMs[titleWords.length]) : 16;
  const sublineDelay = cuesMs && cuesMs[titleWords.length + 1] !== undefined ? toLocal(cuesMs[titleWords.length + 1]) : 28;

  return (
    <AbsoluteFill style={frameStyle}>
      <Words
        text={title}
        gap={4}
        cuesLocalFrames={wordCues}
        style={{ color: theme.ink, fontSize: size.headline + 16, fontWeight: 800, letterSpacing: "-0.035em" }}
      />
      {line ? (
        <Rise delay={lineDelay}>
          <div style={{ color: theme.muted, fontSize: size.body, fontWeight: 500 }}>{line}</div>
        </Rise>
      ) : null}
      {subline ? (
        <>
          <Rule theme={theme} delay={sublineDelay} duration={16} width={200} amp={amp} />
          <Rise delay={sublineDelay}>
            <div
              style={{
                color: theme.accent,
                fontSize: size.body + 8,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                textShadow: `0 6px 26px rgba(239, 35, 60, ${(0.25 + 0.3 * amp).toFixed(3)})`,
              }}
            >
              {subline}
            </div>
          </Rise>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
