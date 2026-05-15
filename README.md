# use-springface

A React hook that drives variable-font axes with pointer-proximity spring physics, plus a chromatic text-shadow stack that trails the motion.

- Live demo: [springface.vercel.app](https://springface.vercel.app/)
- npm: [`use-springface`](https://www.npmjs.com/package/use-springface)

- Per-glyph spring physics on any set of `font-variation-settings` axes
- Chromatic shadow stack pointing away from the cursor — or locked to a fixed angle
- Frame-rate independent (60Hz, 120Hz, 144Hz behave identically)
- Respects `prefers-reduced-motion`
- Imperative — writes inline styles in a `requestAnimationFrame` loop, doesn't re-render React

## Install

```bash
npm install use-springface
```

Peer dependency: `react >= 18`.

## Usage

Wrap your text in any container ref, mark each animated glyph with `data-letter`, and pass the ref + params to the hook.

```tsx
import { useRef } from "react";
import { useSpringface } from "use-springface";

export function Headline() {
  const rootRef = useRef<HTMLElement>(null);

  useSpringface(rootRef, {
    axes: [
      { tag: "wdth", rest: 50,  peak: 120 },
      { tag: "wght", rest: 100, peak: 950 },
    ],
    shadowColors: ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9"],
    shadowStep: 0.02,
    shadowAngle: null,        // null = follow pointer; number = lock to that angle (deg)
    maxDistancePx: 200,
    smoothing: 0.15,
    springStiffness: 220,
    springDamping: 13,
  });

  return (
    <h1 ref={rootRef} style={{ fontFamily: "YourVariableFont" }}>
      {Array.from("ART WILL SURVIVE").map((ch, i) =>
        ch === " " ? (
          <span key={i}>{" "}</span>
        ) : (
          <span key={i} data-letter style={{ display: "inline-block" }}>
            {ch}
          </span>
        ),
      )}
    </h1>
  );
}
```

The hook queries every `[data-letter]` descendant of the ref and animates each one independently. The font must expose the axes you list (`wdth`, `wght`, `opsz`, custom axes, etc.).

## Params

| Param             | Type                         | Notes                                                                                                  |
|-------------------|------------------------------|--------------------------------------------------------------------------------------------------------|
| `axes`            | `Axis[]`                     | `{ tag, rest, peak }` per axis. Interpolated between `rest` and `peak` by pointer proximity.           |
| `shadowColors`    | `string[]`                   | One shadow layer per color, in order.                                                                  |
| `shadowStep`      | `number`                     | Distance between layers, in em.                                                                        |
| `shadowAngle`     | `number \| null`             | `null` follows the pointer. A number locks the angle in degrees (0° = right, 90° = down).              |
| `maxDistancePx`   | `number`                     | Pixel radius around the cursor inside which letters react.                                             |
| `smoothing`       | `number` (0–1)               | Per-60Hz-frame easing on shadow direction/magnitude. Frame-rate-independent.                           |
| `springStiffness` | `number`                     | Spring pulling each axis toward its target. Higher = snappier.                                         |
| `springDamping`   | `number`                     | Resistance. Low overshoots; high settles smoothly.                                                     |

## Notes

- **Reduced motion.** When `prefers-reduced-motion: reduce` is set the hook skips the rAF loop entirely; glyphs sit at their `rest` values. Re-evaluated when the media query changes.
- **Layout cost.** Each glyph's center is measured once on mount and on `resize` — not per frame.
- **Param updates.** All params (except the axis set's tag list) can change every render without restarting the loop.
- **SSR / Next.js.** The hook only touches the DOM inside `useEffect`, so it's SSR-safe. In Next.js app router, mark the consuming component `"use client"`.

## Demo

Source includes a playground at `src/App.tsx` (controls via [Leva](https://github.com/pmndrs/leva)).

```bash
git clone https://github.com/tol-is/springface
cd springface
npm install
npm run dev
```

## License

ISC
