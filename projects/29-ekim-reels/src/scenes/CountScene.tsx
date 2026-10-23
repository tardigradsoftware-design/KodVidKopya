import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Embers, Flash, Grain, LightLeak, Vignette } from "../components/Effects";
import { Photo } from "../components/Photo";
import { anton, C, clamp, easeSoft, pl } from "../theme";

const CELL = 342;
const CELL_W = 176;

// Mechanical odometer: a wheel only starts to turn once the wheel below it is
// about to wrap, so 1923 never shows a half rolled 2 in the thousands place.
const colValue = (year: number, k: number): number => {
  const p = Math.pow(10, k);
  const base = Math.floor(year / p) % 10;
  const frac = year / p - Math.floor(year / p);
  if (k === 0) return base + frac;
  const lower = (year % p) / p;
  return base + Math.min(1, Math.max(0, (lower - 0.985) / 0.015));
};

const Digit: React.FC<{ readonly value: number }> = ({ value }) => {
  const v = ((value % 10) + 10) % 10;
  return (
    <div
      style={{
        width: CELL_W,
        height: CELL,
        overflow: "hidden",
        position: "relative",
        maskImage: "linear-gradient(180deg, transparent 0%, #000 6%, #000 94%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 6%, #000 94%, transparent 100%)",
      }}
    >
      <div style={{ transform: `translateY(${-v * CELL}px)`, willChange: "transform" }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, i) => (
          <div key={i} style={{ height: CELL, lineHeight: `${CELL}px`, textAlign: "center" }}>
            {d}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CountScene: React.FC = () => {
  const f = useCurrentFrame();
  const run = interpolate(f, [10, 118], [0, 1], { ...clamp, easing: easeSoft });
  const year = 1923 + 103 * run;
  const landed = f >= 118;
  const pop = landed ? 1 + 0.05 * (1 - Math.min(1, (f - 118) / 8)) : 1;
  const rule = pl(f, 118, 136);
  const hitFlash = landed ? Math.max(0, 1 - (f - 118) / 10) : 0;
  const leakIn = pl(f, 0, 22);
  const running = interpolate(f, [8, 14, 108, 118], [0, 1, 1, 0], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ground, overflow: "hidden" }}>
      <Photo
        src="img/fireworks.jpg"
        span={146}
        scaleFrom={1.12}
        scaleTo={1.28}
        shiftY={-40}
        brightness={0.62}
        saturate={1.02}
        contrast={1.12}
        tint={0.4}
      />
      <AbsoluteFill style={{ background: "radial-gradient(62% 40% at 50% 47%, rgba(3,3,5,0.72) 0%, rgba(3,3,5,0) 74%)" }} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `translateY(-40px) scale(${pop})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              fontFamily: anton,
              fontSize: 322,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: landed ? C.white : C.ink,
              filter: `blur(${(running * 2.4).toFixed(2)}px)`,
              textShadow: landed
                ? "0 0 90px rgba(227,10,23,0.85), 0 0 30px rgba(255,180,140,0.55)"
                : "0 0 60px rgba(227,10,23,0.35)",
            }}
          >
            <Digit value={colValue(year, 3)} />
            <Digit value={colValue(year, 2)} />
            <Digit value={colValue(year, 1)} />
            <Digit value={colValue(year, 0)} />
          </div>
          <div
            style={{
              height: 6,
              marginTop: 18,
              width: 660 * rule,
              background: `linear-gradient(90deg, rgba(227,10,23,0), ${C.red} 20%, #FF7A5C 50%, ${C.red} 80%, rgba(227,10,23,0))`,
              boxShadow: "0 0 30px rgba(227,10,23,0.9)",
            }}
          />
        </div>
      </AbsoluteFill>

      <Embers count={32} seed={73} warmth={0.75} />
      <LightLeak progress={interpolate(f, [0, 26], [0.1, 0.9], clamp)} color="#FFD7B0" opacity={leakIn * 0.5} angle={58} width={70} />
      <Flash amount={hitFlash * 0.55} color="#FFE8D6" />
      <Vignette strength={0.95} />
      <Grain opacity={0.085} />
    </AbsoluteFill>
  );
};
