import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../theme";

// The Turkish flag is drawn here, not imported: official proportions from
// Turk Bayragi Kanunu 2893 (ekli cetvel) and the 85/9034 regulation.
//   G = 1000 units of height, L = 1.5 G -> 1500 x 1000
//   A = G/2      outer crescent centre from the hoist
//   B = G/2      outer crescent diameter
//   C = G/16     distance between the two crescent centres
//   D = 0.4 G    inner crescent diameter
//   E = G/3      inner crescent to star circle (nominal)
//   F = G/4      star circle diameter
// A point of the star sits on the axis where the line through the two crescent
// tips crosses it, which puts the star centre at x = 836.25.
const UNITS_W = 1500;
const UNITS_H = 1000;

const OUTER = { cx: 500, cy: 500, r: 250 };
const INNER = { cx: 562.5, cy: 500, r: 200 };
export const STAR = { cx: 836.25, cy: 500, r: 125 };

const starPoints = (): string => {
  const pts: string[] = [];
  for (const k of [0, 2, 4, 1, 3]) {
    const a = Math.PI + (k * 2 * Math.PI) / 5;
    pts.push(`${(STAR.cx + STAR.r * Math.cos(a)).toFixed(2)},${(STAR.cy + STAR.r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
};

const flagSvg = (fill: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${UNITS_W} ${UNITS_H}" width="${UNITS_W}" height="${UNITS_H}">` +
  `<rect width="${UNITS_W}" height="${UNITS_H}" fill="${fill}"/>` +
  `<path fill="#ffffff" fill-rule="evenodd" d="M ${OUTER.cx - OUTER.r} ${OUTER.cy} A ${OUTER.r} ${OUTER.r} 0 1 0 ${OUTER.cx + OUTER.r} ${OUTER.cy} A ${OUTER.r} ${OUTER.r} 0 1 0 ${OUTER.cx - OUTER.r} ${OUTER.cy} Z M ${INNER.cx - INNER.r} ${INNER.cy} A ${INNER.r} ${INNER.r} 0 1 0 ${INNER.cx + INNER.r} ${INNER.cy} A ${INNER.r} ${INNER.r} 0 1 0 ${INNER.cx - INNER.r} ${INNER.cy} Z"/>` +
  `<polygon points="${starPoints()}" fill="#ffffff"/>` +
  `</svg>`;

const FLAG_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(flagSvg(C.red))}`;

/** Size of the cloth on screen at scale 1 (px). The frame is a close crop of it. */
const PLANE_W = 3600;
const PLANE_H = 2400;
const STRIPS = 72;
const STRIP_W = PLANE_W / STRIPS;

export type FlagCam = {
  /** Flag-space point (0..1500, 0..1000) that sits at the centre of the frame. */
  readonly cx: number;
  readonly cy: number;
  readonly scale: number;
  readonly rot: number;
  /** Keeps advancing: drives the wave. */
  readonly phase: number;
  /** 0..1 extra billow. */
  readonly gust: number;
};

/** A waving flag built from vertical strips pushed through a 3D wave. */
export const Flag: React.FC<{ readonly cam: FlagCam }> = ({ cam }) => {
  const s = cam.scale;
  const left = 540 - (cam.cx / UNITS_W) * PLANE_W * s;
  const top = 960 - (cam.cy / UNITS_H) * PLANE_H * s;
  const amp = 70 + 46 * cam.gust;

  return (
    <AbsoluteFill style={{ overflow: "hidden", perspective: 2600, perspectiveOrigin: "50% 46%", backgroundColor: C.deepRed }}>
      <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotate(${cam.rot}deg)` }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: PLANE_W,
            height: PLANE_H,
            transformOrigin: "0 0",
            transformStyle: "preserve-3d",
            transform: `translate(${left}px, ${top}px) scale(${s})`,
          }}
        >
          {new Array(STRIPS).fill(0).map((_, i) => {
            const u = (i + 0.5) / STRIPS;
            const phase = cam.phase + u * 6.1 + 0.35 * Math.sin(u * 11 + cam.phase * 0.6);
            const z = amp * Math.sin(phase) + 0.34 * amp * Math.sin(phase * 2.2 + 1.1);
            const ry = 13 * Math.cos(phase) + 4 * Math.cos(phase * 2.2);
            const light = 0.5 + 0.5 * Math.cos(phase + 0.85);
            const shade = 0.62 - 0.42 * light;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: i * STRIP_W,
                  top: 0,
                  width: STRIP_W + 1.5,
                  height: PLANE_H,
                  transform: `translateZ(${z}px) rotateY(${ry}deg)`,
                  transformOrigin: "50% 50%",
                  backgroundImage: [
                    `repeating-linear-gradient(90deg, rgba(0,0,0,0.10) 0px, rgba(0,0,0,0.10) 1px, rgba(255,255,255,0.045) 1.5px, rgba(255,255,255,0.045) 3px)`,
                    `linear-gradient(rgba(0,0,0,${shade.toFixed(3)}), rgba(0,0,0,${shade.toFixed(3)}))`,
                    `url("${FLAG_URL}")`,
                  ].join(", "),
                  backgroundSize: `100% 100%, 100% 100%, ${PLANE_W}px ${PLANE_H}px`,
                  backgroundPosition: `0 0, 0 0, ${-i * STRIP_W}px 0px`,
                  backfaceVisibility: "hidden",
                }}
              />
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
