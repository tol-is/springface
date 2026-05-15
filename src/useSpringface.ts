import { useEffect, useRef, type RefObject } from "react";

export type Axis = { tag: string; rest: number; peak: number };

export type UseSpringfaceParams = {
  axes: Axis[];
  shadowColors: string[];
  shadowStep: number;
  maxDistance: number;
  smoothing: number;
  shadowMode: 'mouse' | 'fixed';
  shadowAngle: number;
  springStiffness: number;
  springDamping: number;
};

const buildShadow = (
  ux: number,
  uy: number,
  magnitude: number,
  step: number,
  colors: string[],
) =>
  colors
    .map((color, i) => {
      const k = step * (i + 1) * magnitude;
      return `${(ux * k).toFixed(4)}em ${(uy * k).toFixed(4)}em 0 ${color}`;
    })
    .join(", ");

const buildVariation = (values: number[], axes: Axis[]) =>
  axes.map((a, i) => `'${a.tag}' ${values[i].toFixed(2)}`).join(", ");

export const useSpringface = (
  rootRef: RefObject<HTMLElement | null>,
  params: UseSpringfaceParams,
) => {
  const paramsRef = useRef(params);
  paramsRef.current = params;

  // Re-init state when axis set changes (count/order/tag), not on value tweaks.
  const axisKey = params.axes.map((a) => a.tag).join(",");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const letters = Array.from(
      root.querySelectorAll<HTMLElement>("[data-letter]"),
    );
    const state = letters.map(() => ({
      ux: Math.SQRT1_2,
      uy: Math.SQRT1_2,
      mag: 0,
      axisValues: paramsRef.current.axes.map((a) => a.rest),
      axisVels: paramsRef.current.axes.map(() => 0),
    }));

    const positions = letters.map(() => ({ cx: 0, cy: 0 }));

    const measurePositions = () => {
      for (let i = 0; i < letters.length; i++) {
        const r = letters[i].getBoundingClientRect();
        positions[i].cx = r.left + r.width / 2 + window.scrollX;
        positions[i].cy = r.top + r.height / 2 + window.scrollY;
      }
    };
    measurePositions();

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let lastTime = performance.now();
    let rafId = 0;

    const onMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onPointerEnd = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") {
        mouseX = -9999;
        mouseY = -9999;
      }
    };

    const onResize = () => measurePositions();

    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const mxPage = mouseX + window.scrollX;
      const myPage = mouseY + window.scrollY;

      const {
        shadowStep,
        maxDistance,
        smoothing,
        shadowMode,
        shadowAngle,
        springStiffness,
        springDamping,
        axes,
        shadowColors,
      } = paramsRef.current;

      const fixed = shadowMode === 'fixed';
      const angleRad = (shadowAngle * Math.PI) / 180;
      const fixedUx = Math.cos(angleRad);
      const fixedUy = Math.sin(angleRad);

      for (let i = 0; i < letters.length; i++) {
        const s = state[i];
        const p = positions[i];

        const dx = p.cx - mxPage;
        const dy = p.cy - myPage;
        const d = Math.hypot(dx, dy);
        const proximity = Math.max(0, Math.min(1, 1 - d / maxDistance));
        const targetUx = fixed ? fixedUx : d === 0 ? s.ux : dx / d;
        const targetUy = fixed ? fixedUy : d === 0 ? s.uy : dy / d;

        s.ux += (targetUx - s.ux) * smoothing;
        s.uy += (targetUy - s.uy) * smoothing;
        s.mag += (proximity - s.mag) * smoothing;

        for (let a = 0; a < axes.length; a++) {
          const axis = axes[a];
          const target = axis.rest + (axis.peak - axis.rest) * proximity;
          const force = -springStiffness * (s.axisValues[a] - target);
          s.axisVels[a] += (force - springDamping * s.axisVels[a]) * dt;
          s.axisValues[a] += s.axisVels[a] * dt;
        }

        letters[i].style.fontVariationSettings = buildVariation(
          s.axisValues,
          axes,
        );
        letters[i].style.textShadow = buildShadow(
          s.ux,
          s.uy,
          s.mag,
          shadowStep,
          shadowColors,
        );
      }

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onPointerEnd, { passive: true });
    window.addEventListener("pointercancel", onPointerEnd, { passive: true });
    window.addEventListener("resize", onResize);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafId);
    };
  }, [rootRef, axisKey]);
};
