# springface

Variable-font typography that springs toward your cursor. Each glyph's `wdth` and `wght` axes are driven by spring physics tied to pointer proximity, with a chromatic shadow stack that trails the motion.

> ART WILL / SURVIVE / ARTISTS WON'T

## Run it

```bash
npm install
npm run dev
```

## How it works

The animation lives in `src/Type.tsx`. On every frame, for each letter:

- **Proximity** — distance from the pointer to the letter's center, clamped to `MAX_DISTANCE`, gives a `0..1` weight.
- **Axes** — `wdth` and `wght` targets are interpolated between rest (`50`, `400`) and peak (`120`, `700`) by that weight, then driven through a critically-tuned spring (`SPRING_STIFFNESS`, `SPRING_DAMPING`).
- **Shadow** — a stack of colored offsets is laid out along the unit vector pointing from cursor to glyph, scaled by the same proximity magnitude. The shadow lags behind because the unit vector and magnitude are themselves smoothed.

Letter centers are measured once on mount and on resize, so layout stays cheap during the rAF loop.

## Stack

Vite · React 18 · TypeScript · Tailwind v4
