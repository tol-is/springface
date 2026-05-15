import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

export type Axis = { tag: string; rest: number; peak: number };

export type UseSpringfaceParams = {
  /** Variable-font axes to animate. Each entry interpolates between `rest` and `peak` by pointer proximity. */
  axes: Axis[];
  /** Palette used to build the stacked text-shadow trailing each glyph. One layer is rendered per color. */
  shadowColors: string[];
  /** Distance between consecutive shadow layers, in em. */
  shadowStep: number;
  /** Pixel radius around the cursor inside which letters react. Letters beyond this radius rest at `axis.rest`. */
  maxDistancePx: number;
  /**
   * Per-frame easing on the shadow's direction and magnitude, expressed as the fraction
   * a 60Hz frame would close toward its target. 0 freezes, 1 snaps instantly. Applied
   * frame-rate-independently — the same value behaves identically at 60Hz, 120Hz, and 144Hz.
   */
  smoothing: number;
  /** Shadow direction. `null` makes the shadow point away from the pointer; a number locks it to that angle in degrees (0° = right, 90° = down). */
  shadowAngle: number | null;
  /** Spring stiffness driving each axis toward its proximity-weighted target. Higher = snappier. */
  springStiffness: number;
  /** Spring damping resisting axis motion. Low damping overshoots; high damping settles smoothly. */
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

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const useSpringface = (
  rootRef: RefObject<HTMLElement | null>,
  params: UseSpringfaceParams,
) => {
  const paramsRef = useRef(params);
  // useLayoutEffect — not render-time assignment — so the ref tracks the committed render
  // under React 18 concurrent rendering instead of any speculative one.
  useLayoutEffect(() => {
    paramsRef.current = params;
  });

  // Re-init letter state only when the axis set changes (count/order/tag), not on value tweaks.
  const axisKey = params.axes.map((a) => a.tag).join(",");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mql =
      typeof window !== "undefined" && "matchMedia" in window
        ? window.matchMedia(REDUCED_MOTION_QUERY)
        : null;

    let cleanupAnimation: (() => void) | null = null;
    let isVisible = false;

    const startAnimation = () => {
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
          maxDistancePx,
          smoothing,
          shadowAngle,
          springStiffness,
          springDamping,
          axes,
          shadowColors,
        } = paramsRef.current;

        // Frame-rate-independent easing: `smoothing` is the fraction-per-60Hz-frame the
        // user expects, normalized to whatever dt this frame actually took.
        const easeAlpha = 1 - Math.pow(1 - smoothing, dt * 60);

        const useAngle = shadowAngle !== null;
        const angleRad = useAngle ? (shadowAngle * Math.PI) / 180 : 0;
        const angleUx = useAngle ? Math.cos(angleRad) : 0;
        const angleUy = useAngle ? Math.sin(angleRad) : 0;

        for (let i = 0; i < letters.length; i++) {
          const s = state[i];
          const p = positions[i];

          const dx = p.cx - mxPage;
          const dy = p.cy - myPage;
          const d = Math.hypot(dx, dy);
          const proximity = Math.max(0, Math.min(1, 1 - d / maxDistancePx));
          const targetUx = useAngle ? angleUx : d === 0 ? s.ux : dx / d;
          const targetUy = useAngle ? angleUy : d === 0 ? s.uy : dy / d;

          s.ux += (targetUx - s.ux) * easeAlpha;
          s.uy += (targetUy - s.uy) * easeAlpha;
          s.mag += (proximity - s.mag) * easeAlpha;

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
    };

    const sync = () => {
      const motionAllowed = !mql || !mql.matches;
      const shouldRun = motionAllowed && isVisible;
      if (shouldRun && !cleanupAnimation) {
        cleanupAnimation = startAnimation();
      } else if (!shouldRun && cleanupAnimation) {
        cleanupAnimation();
        cleanupAnimation = null;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isVisible = entry.isIntersecting;
        }
        sync();
      },
    );
    observer.observe(root);

    mql?.addEventListener("change", sync);

    return () => {
      observer.disconnect();
      mql?.removeEventListener("change", sync);
      cleanupAnimation?.();
    };
  }, [rootRef, axisKey]);
};
