import React, { useRef } from "react";
import "./Type.css";
import { useSpringface, type Axis } from "./lib";

export type { Axis };

export type TypeProps = {
  lines: string[];
  shadowColors: string[];
  axes: Axis[];
  shadowStep: number;
  maxDistancePx: number;
  smoothing: number;
  shadowAngle: number | null;
  springStiffness: number;
  springDamping: number;
};

export const Type = ({
  lines,
  shadowColors,
  axes,
  shadowStep,
  maxDistancePx,
  smoothing,
  shadowAngle,
  springStiffness,
  springDamping,
}: TypeProps) => {
  const rootRef = useRef<HTMLElement>(null);

  useSpringface(rootRef, {
    axes,
    shadowColors,
    shadowStep,
    maxDistancePx,
    smoothing,
    shadowAngle,
    springStiffness,
    springDamping,
  });

  const initialVariation = axes
    .map((a) => `'${a.tag}' ${a.rest}`)
    .join(", ");

  return (
    <section ref={rootRef} className="type-root">
      <h1
        className="type-heading"
        style={{ fontVariationSettings: initialVariation }}
      >
        {lines.map((line) => (
          <span key={line} className="type-line" aria-label={line}>
            {Array.from(line).map((ch, i) =>
              ch === " " ? (
                <span key={i} aria-hidden="true">
                  {" "}
                </span>
              ) : (
                <span
                  key={i}
                  data-letter=""
                  aria-hidden="true"
                  className="type-letter"
                >
                  {ch}
                </span>
              ),
            )}
          </span>
        ))}
      </h1>
    </section>
  );
};
