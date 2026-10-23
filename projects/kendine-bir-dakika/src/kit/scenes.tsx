import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Burst, Counter, Icon, LightSweep, Pop, Rise, Rule, ShockRing, Words } from "./parts";
import { clamp, easeIn, fonts, size, Theme, useLayout } from "./theme";

// Every scene is transparent: the Background is shared by the whole film, so cuts move content, not the world.
// Each scene gets `theme` and `length` (its visible frames).
type Base = { readonly theme: Theme; readonly length: number };

const useFrameStyle = (): React.CSSProperties => {
  const L = useLayout();
  return {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: L.padTop,
    paddingBottom: L.padBottom,
    paddingLeft: L.padX,
    paddingRight: L.padX,
    gap: 34 * L.unit,
    textAlign: "center",
  };
};

const headline = (t: Theme, px: number): React.CSSProperties => ({
  fontFamily: t.display,
  fontWeight: t.displayWeight,
  fontSize: px,
  color: t.ink,
  letterSpacing: t.display === fonts.playfair ? "-0.01em" : "-0.03em",
  lineHeight: 1.08,
});

export type HookProps = { readonly text: string; readonly highlight?: string };
// The first 1 to 3 seconds: a short, bold question or promise. Lands with a ring and a burst.
export const HookScene: React.FC<HookProps & Base> = ({ text, highlight, theme }) => {
  const L = useLayout();
  return (
    <AbsoluteFill style={useFrameStyle()}>
      <ShockRing color={theme.accent} at={2} />
      <Burst color={theme.accent} color2={theme.accent2} at={4} seed="hook" />
      <Words text={text} gap={3} highlight={highlight} highlightColor={theme.accent} style={{ ...headline(theme, size.hero * L.unit * (L.vertical ? 0.86 : 1)), maxWidth: L.maxText }} />
      <LightSweep at={10} />
    </AbsoluteFill>
  );
};

export type TitleProps = { readonly title: string; readonly subtitle?: string };
export const TitleScene: React.FC<TitleProps & Base> = ({ title, subtitle, theme }) => {
  const L = useLayout();
  return (
    <AbsoluteFill style={useFrameStyle()}>
      <Words text={title} gap={3} style={{ ...headline(theme, size.hero * L.unit), maxWidth: L.maxText }} />
      <Rule color={theme.accent} delay={10} width={200 * L.unit} />
      {subtitle ? <Rise delay={14}><div style={{ fontFamily: theme.sans, color: theme.muted, fontSize: size.body * L.unit, fontWeight: 500 }}>{subtitle}</div></Rise> : null}
      <LightSweep at={14} />
    </AbsoluteFill>
  );
};

export type TipProps = { readonly number?: number; readonly icon?: string; readonly title: string; readonly detail?: string };
// One numbered tip: a badge with the number, a Lucide icon, a short title and an optional detail line.
export const TipScene: React.FC<TipProps & Base> = ({ number, icon = "Sparkles", title, detail, theme }) => {
  const L = useLayout();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={useFrameStyle()}>
      <div style={{ position: "relative", width: 260 * L.unit, height: 260 * L.unit, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "absolute", inset: 0, borderRadius: "50%", backgroundColor: theme.accent2,
            scale: interpolate(frame, [0, 12], [0, 1], { ...clamp, easing: easeIn }),
          }}
        />
        <Pop delay={6}><Icon name={icon} size={130 * L.unit} color={theme.accent} /></Pop>
        {number !== undefined ? (
          <Pop delay={10} style={{ position: "absolute", right: -10 * L.unit, top: -10 * L.unit }}>
            <div style={{ width: 96 * L.unit, height: 96 * L.unit, borderRadius: "50%", backgroundColor: theme.accent, color: "#ffffff", fontFamily: theme.sans, fontWeight: 800, fontSize: 52 * L.unit, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {number}
            </div>
          </Pop>
        ) : null}
      </div>
      <Words text={title} delay={10} gap={3} style={{ ...headline(theme, size.headline * L.unit), maxWidth: L.maxText }} />
      {detail ? <Rise delay={20}><div style={{ fontFamily: theme.sans, color: theme.muted, fontSize: size.body * L.unit, maxWidth: L.maxText }}>{detail}</div></Rise> : null}
    </AbsoluteFill>
  );
};

export type QuoteProps = { readonly quote: string; readonly author?: string };
// An elegant quote with a large drawn quotation mark. Only real, correctly attributed quotes.
export const QuoteScene: React.FC<QuoteProps & Base> = ({ quote, author, theme }) => {
  const L = useLayout();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={useFrameStyle()}>
      <div style={{ fontFamily: fonts.playfair, fontWeight: 800, fontSize: 260 * L.unit, lineHeight: 0.6, color: theme.accent, opacity: interpolate(frame, [0, 8], [0, 1], clamp), scale: interpolate(frame, [0, 14], [1.6, 1], { ...clamp, easing: easeIn }) }}>“</div>
      <Words text={quote} delay={6} gap={3} style={{ fontFamily: fonts.playfair, fontWeight: 600, fontSize: size.headline * 0.82 * L.unit, color: theme.ink, lineHeight: 1.2, maxWidth: L.maxText }} />
      {author ? <Rise delay={24}><div style={{ fontFamily: theme.sans, color: theme.muted, fontSize: size.small * L.unit, letterSpacing: "0.04em" }}>{author}</div></Rise> : null}
    </AbsoluteFill>
  );
};

export type FactProps = { readonly value: number; readonly prefix?: string; readonly suffix?: string; readonly decimals?: number; readonly text: string };
// A real number that counts up, with the sentence that gives it meaning. Never invent numbers.
export const FactScene: React.FC<FactProps & Base> = ({ value, prefix, suffix, decimals, text, theme }) => {
  const L = useLayout();
  return (
    <AbsoluteFill style={useFrameStyle()}>
      <Pop delay={2}>
        <div style={{ ...headline(theme, size.hero * 1.45 * L.unit), color: theme.accent, fontVariantNumeric: "tabular-nums" }}>
          <Counter value={value} prefix={prefix} suffix={suffix} decimals={decimals} from={4} to={30} />
        </div>
      </Pop>
      <Words text={text} delay={14} gap={3} style={{ fontFamily: theme.sans, fontWeight: 600, color: theme.ink, fontSize: size.body * 1.1 * L.unit, maxWidth: L.maxText }} />
      <ShockRing color={theme.accent} at={30} />
    </AbsoluteFill>
  );
};

export type StatementProps = { readonly text: string; readonly highlight?: string };
// One sentence, word by word. Words in `highlight` (space separated) get the accent color.
export const StatementScene: React.FC<StatementProps & Base> = ({ text, highlight, theme }) => {
  const L = useLayout();
  return (
    <AbsoluteFill style={useFrameStyle()}>
      <Words text={text} gap={4} highlight={highlight} highlightColor={theme.accent} style={{ ...headline(theme, size.headline * L.unit), maxWidth: L.maxText }} />
    </AbsoluteFill>
  );
};

export type ListProps = { readonly title: string; readonly items: string[]; readonly icons?: string[] };
// A title and up to 5 short items that arrive one by one, each with an optional Lucide icon.
export const ListScene: React.FC<ListProps & Base> = ({ title, items, icons, theme }) => {
  const L = useLayout();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={useFrameStyle()}>
      <Words text={title} gap={3} style={{ ...headline(theme, size.headline * L.unit), maxWidth: L.maxText }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 26 * L.unit, alignItems: "flex-start", marginTop: 10 * L.unit }}>
        {items.slice(0, 5).map((item, i) => {
          const s = 12 + i * 8;
          return (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: 24 * L.unit, color: theme.ink, fontFamily: theme.sans,
                fontSize: size.body * L.unit, fontWeight: 600, textAlign: "left",
                opacity: interpolate(frame, [s, s + 8], [0, 1], clamp),
                translate: interpolate(frame, [s, s + 14], ["90px 0px", "0px 0px"], { ...clamp, easing: easeIn }),
              }}
            >
              <div style={{ width: 72 * L.unit, height: 72 * L.unit, borderRadius: "50%", backgroundColor: theme.accent2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={icons?.[i] ?? "Check"} size={40 * L.unit} color={theme.accent} strokeWidth={2.4} />
              </div>
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
export const ChipsScene: React.FC<ChipsProps & Base> = ({ title, chips, theme }) => {
  const L = useLayout();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={useFrameStyle()}>
      {title ? <Words text={title} gap={3} style={{ ...headline(theme, size.headline * L.unit), maxWidth: L.maxText }} /> : null}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 22 * L.unit, maxWidth: L.maxText }}>
        {chips.slice(0, 6).map((c, i) => {
          const s = 8 + i * 5;
          return (
            <div key={i} style={{ fontFamily: theme.sans, color: theme.ink, fontSize: size.small * L.unit, fontWeight: 600, padding: `${16 * L.unit}px ${34 * L.unit}px`, border: `3px solid ${theme.accent}`, borderRadius: 999, opacity: interpolate(frame, [s, s + 6], [0, 1], clamp), scale: interpolate(frame, [s, s + 12], [1.3, 1], { ...clamp, easing: easeIn }) }}>
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
export const CodeScene: React.FC<CodeProps & Base> = ({ title, code, theme }) => {
  const L = useLayout();
  const frame = useCurrentFrame();
  const lines = code.replace(/\t/g, "  ").split("\n").slice(0, 10);
  return (
    <AbsoluteFill style={useFrameStyle()}>
      {title ? <Words text={title} gap={3} style={{ ...headline(theme, (size.body + 14) * L.unit) }} /> : null}
      <div style={{ textAlign: "left", fontFamily: fonts.mono, fontSize: size.code * L.unit, lineHeight: 1.5, color: theme.ink, backgroundColor: "rgba(127,127,127,0.10)", border: "1px solid rgba(127,127,127,0.25)", borderRadius: 24 * L.unit, padding: `${36 * L.unit}px ${48 * L.unit}px`, maxWidth: L.maxText }}>
        {lines.map((l, i) => {
          const s = 10 + i * 5;
          return (
            <div key={i} style={{ whiteSpace: "pre", opacity: interpolate(frame, [s, s + 6], [0, 1], clamp), translate: interpolate(frame, [s, s + 10], ["24px 0px", "0px 0px"], { ...clamp, easing: easeIn }) }}>
              <span style={{ color: theme.muted, marginRight: 28 * L.unit }}>{String(i + 1).padStart(2, " ")}</span>{l || " "}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export type ImageProps = { readonly src: string; readonly title?: string };
// A full-frame image (a generated image or a photo you may use) with depth: slow push, drift, a light sweep and a title.
// `src` is a file in public/ or a URL.
export const ImageScene: React.FC<ImageProps & Base> = ({ src, title, theme, length }) => {
  const L = useLayout();
  const fs = useFrameStyle();
  const frame = useCurrentFrame();
  const url = /^https?:\/\//.test(src) ? src : staticFile(src);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ scale: interpolate(frame, [0, length], [1.18, 1.04], { ...clamp, easing: easeIn }), translate: interpolate(frame, [0, length], ["0px 0px", `${-30 * L.unit}px ${-20 * L.unit}px`], clamp) }}>
        <Img src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(rgba(0,0,0,0.25), transparent 30%, transparent 50%, rgba(0,0,0,0.65))" }} />
      <LightSweep at={8} duration={30} />
      {title ? (
        <AbsoluteFill style={{ ...fs, justifyContent: "flex-end" }}>
          <Words text={title} delay={8} gap={3} style={{ ...headline(theme, size.headline * L.unit), color: "#ffffff", textShadow: "0 4px 30px rgba(0,0,0,0.5)", maxWidth: L.maxText }} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export type CtaProps = { readonly text?: string; readonly icons?: string[] };
// The ask at the end, under 2.5 s: save, share, follow. Icons pop in one by one.
export const CtaScene: React.FC<CtaProps & Base> = ({ text = "Kaydet • Paylaş • Takip et", icons = ["Bookmark", "Send", "UserPlus"], theme }) => {
  const L = useLayout();
  return (
    <AbsoluteFill style={useFrameStyle()}>
      <div style={{ display: "flex", gap: 46 * L.unit }}>
        {icons.slice(0, 4).map((name, i) => (
          <Pop key={i} delay={2 + i * 5}>
            <div style={{ width: 170 * L.unit, height: 170 * L.unit, borderRadius: "50%", backgroundColor: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 20px 60px ${theme.accent}55` }}>
              <Icon name={name} size={84 * L.unit} color="#ffffff" strokeWidth={2.2} />
            </div>
          </Pop>
        ))}
      </div>
      <Words text={text} delay={14} gap={3} style={{ fontFamily: theme.sans, fontWeight: 800, fontSize: size.body * 1.1 * L.unit, color: theme.ink, maxWidth: L.maxText }} />
      <Burst color={theme.accent} color2={theme.accent2} at={16} seed="cta" />
    </AbsoluteFill>
  );
};

export type ClosingProps = { readonly title: string; readonly line?: string };
// A quieter ending: smaller than the opening.
export const ClosingScene: React.FC<ClosingProps & Base> = ({ title, line, theme }) => {
  const L = useLayout();
  return (
    <AbsoluteFill style={useFrameStyle()}>
      <Words text={title} gap={4} style={{ ...headline(theme, size.headline * L.unit), maxWidth: L.maxText }} />
      {line ? <Rise delay={16}><div style={{ fontFamily: theme.sans, color: theme.accent, fontSize: size.body * L.unit, fontWeight: 600 }}>{line}</div></Rise> : null}
    </AbsoluteFill>
  );
};
