import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Rise, Rule, Words } from "./parts";
import { clamp, easeIn, fonts, size, Theme } from "./theme";

// Every scene is transparent: the Background is shared by the whole film, so scene changes move content, not the world.
const frameStyle: React.CSSProperties = {
  alignItems: "center",
  justifyContent: "center",
  padding: "100px 120px",
  gap: 36,
  fontFamily: fonts.sans,
  textAlign: "center",
};

export type TitleProps = { readonly title: string; readonly subtitle?: string };
export const TitleScene: React.FC<TitleProps & { readonly theme: Theme }> = ({ title, subtitle, theme }) => (
  <AbsoluteFill style={frameStyle}>
    <Words text={title} gap={3} style={{ color: theme.ink, fontSize: size.hero, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05 }} />
    <Rule theme={theme} delay={10} />
    {subtitle ? (
      <Rise delay={14}>
        <div style={{ color: theme.muted, fontSize: size.body, fontWeight: 500 }}>{subtitle}</div>
      </Rise>
    ) : null}
  </AbsoluteFill>
);

export type StatementProps = { readonly text: string; readonly highlight?: string };
// One sentence, word by word. Words in `highlight` (space separated) get the accent color.
export const StatementScene: React.FC<StatementProps & { readonly theme: Theme }> = ({ text, highlight, theme }) => {
  const frame = useCurrentFrame();
  const marked = new Set((highlight ?? "").toLowerCase().split(/\s+/).filter(Boolean));
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <AbsoluteFill style={frameStyle}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: "0.28em", maxWidth: 1500 }}>
        {words.map((w, i) => {
          const s = i * 5;
          const isMarked = marked.has(w.toLowerCase().replace(/[.,!?;:]/g, ""));
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                color: isMarked ? theme.accent : theme.ink,
                fontSize: size.headline,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                opacity: interpolate(frame, [s, s + 6], [0, 1], clamp),
                translate: interpolate(frame, [s, s + 12], ["0px 36px", "0px 0px"], { ...clamp, easing: easeIn }),
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export type ListProps = { readonly title: string; readonly items: string[] };
// A title and up to 5 short items that arrive one by one from the right.
export const ListScene: React.FC<ListProps & { readonly theme: Theme }> = ({ title, items, theme }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ ...frameStyle, alignItems: "center" }}>
      <Words text={title} gap={3} style={{ color: theme.ink, fontSize: size.headline, fontWeight: 800, letterSpacing: "-0.03em" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-start", marginTop: 12 }}>
        {items.slice(0, 5).map((item, i) => {
          const s = 12 + i * 8;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                color: theme.ink,
                fontSize: size.body,
                fontWeight: 500,
                opacity: interpolate(frame, [s, s + 8], [0, 1], clamp),
                translate: interpolate(frame, [s, s + 14], ["90px 0px", "0px 0px"], { ...clamp, easing: easeIn }),
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: theme.accent, flexShrink: 0 }} />
              {item}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export type ChipsProps = { readonly title?: string; readonly chips: string[] };
// Up to 6 short labels, for tools, features or keywords.
export const ChipsScene: React.FC<ChipsProps & { readonly theme: Theme }> = ({ title, chips, theme }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={frameStyle}>
      {title ? <Words text={title} gap={3} style={{ color: theme.ink, fontSize: size.headline, fontWeight: 800, letterSpacing: "-0.03em" }} /> : null}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24, maxWidth: 1500 }}>
        {chips.slice(0, 6).map((c, i) => {
          const s = 8 + i * 5;
          return (
            <div
              key={i}
              style={{
                color: theme.ink,
                fontSize: size.small,
                fontWeight: 500,
                padding: "16px 36px",
                border: `2px solid ${theme.accent}`,
                borderRadius: 999,
                opacity: interpolate(frame, [s, s + 6], [0, 1], clamp),
                scale: interpolate(frame, [s, s + 12], [1.25, 1], { ...clamp, easing: easeIn }),
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
// Code lines reveal one by one. Keep it under 10 short lines.
export const CodeScene: React.FC<CodeProps & { readonly theme: Theme }> = ({ title, code, theme }) => {
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
            <div key={i} style={{ whiteSpace: "pre", opacity: interpolate(frame, [s, s + 6], [0, 1], clamp), translate: interpolate(frame, [s, s + 10], ["24px 0px", "0px 0px"], { ...clamp, easing: easeIn }) }}>
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
// A full-frame image with a slow push-in and an optional caption. `src` is a file in public/ or a URL.
export const ImageScene: React.FC<ImageProps & { readonly theme: Theme }> = ({ src, caption, theme }) => {
  const frame = useCurrentFrame();
  const url = /^https?:\/\//.test(src) ? src : staticFile(src);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ scale: interpolate(frame, [0, 150], [1.12, 1.02], { ...clamp, easing: easeIn }) }}>
        <Img src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(transparent 55%, rgba(0,0,0,0.7))" }} />
      {caption ? (
        <AbsoluteFill style={{ ...frameStyle, justifyContent: "flex-end" }}>
          <Words text={caption} delay={8} style={{ color: theme.ink, fontSize: size.body + 8, fontWeight: 800 }} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export type ClosingProps = { readonly title: string; readonly line?: string };
// A quieter ending: smaller than the opening, no logo-tagline-button footer.
export const ClosingScene: React.FC<ClosingProps & { readonly theme: Theme }> = ({ title, line, theme }) => (
  <AbsoluteFill style={frameStyle}>
    <Words text={title} gap={4} style={{ color: theme.ink, fontSize: size.headline, fontWeight: 800, letterSpacing: "-0.03em" }} />
    {line ? (
      <Rise delay={16}>
        <div style={{ color: theme.accent, fontSize: size.body, fontWeight: 500 }}>{line}</div>
      </Rise>
    ) : null}
  </AbsoluteFill>
);
