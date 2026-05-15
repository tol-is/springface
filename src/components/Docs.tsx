import React from "react";
import "./Docs.css";

type PropDoc = {
  name: string;
  type: string;
  defaultValue: string;
  description: string;
};

type PropGroup = {
  title: string;
  blurb: string;
  props: PropDoc[];
};

const groups: PropGroup[] = [
  {
    title: "Arguments",
    blurb:
      "useSpringface takes a ref to the container holding the letters and a params object describing the motion.",
    props: [
      {
        name: "rootRef",
        type: "RefObject<HTMLElement>",
        defaultValue: "required",
        description:
          "Ref to the element that wraps the glyphs. The hook queries every descendant with a [data-letter] attribute and animates each one individually.",
      },
      {
        name: "params",
        type: "UseSpringfaceParams",
        defaultValue: "required",
        description:
          "Object holding axes, shadow palette, and motion tuning. The hook re-reads it every frame, so you can change values without re-mounting.",
      },
    ],
  },
  {
    title: "Axes",
    blurb:
      "Variable-font axes that respond to cursor proximity. Each axis interpolates between rest and peak.",
    props: [
      {
        name: "axes",
        type: "Axis[]",
        defaultValue: "required",
        description:
          "List of axes to animate. Each entry is { tag, rest, peak } — for example { tag: 'wght', rest: 100, peak: 950 } drives the weight axis. Changing the tag set re-initializes letter state.",
      },
    ],
  },
  {
    title: "Shadow",
    blurb:
      "Palette, spacing, and direction of the layered text-shadow that trails the cursor.",
    props: [
      {
        name: "shadowColors",
        type: "string[]",
        defaultValue: "required",
        description:
          "Palette used to build the chromatic stack behind each glyph. One layer is rendered per color, in order, scaled by shadowStep.",
      },
      {
        name: "shadowStep",
        type: "number",
        defaultValue: "0.02",
        description:
          "Distance between consecutive shadow layers, measured in em. Smaller values keep the chroma tight; larger values fan it out.",
      },
      {
        name: "shadowAngle",
        type: "number | null",
        defaultValue: "null",
        description:
          "Direction the shadow stack points. null lets each glyph aim its shadow away from the cursor; a number locks the angle in degrees (0° right, 90° down) for a typographic poster look.",
      },
    ],
  },
  {
    title: "Motion",
    blurb:
      "Physics for how each glyph chases the cursor — proximity falloff, smoothing on the shadow vector, and a real spring on the axes. Respects prefers-reduced-motion: when the OS preference is set, glyphs hold their rest values and the rAF loop is skipped.",
    props: [
      {
        name: "maxDistancePx",
        type: "number",
        defaultValue: "200",
        description:
          "Pixel radius around the cursor inside which letters respond. Anything beyond this radius rests at the rest value.",
      },
      {
        name: "smoothing",
        type: "number",
        defaultValue: "0.15",
        description:
          "Easing applied to shadow direction and magnitude, expressed as the fraction a 60Hz frame closes toward its target. 0 freezes; 1 snaps instantly. Frame-rate-independent — the same value behaves identically at 60Hz, 120Hz, or 144Hz.",
      },
      {
        name: "springStiffness",
        type: "number",
        defaultValue: "220",
        description:
          "How aggressively each axis is pulled toward its target. Higher stiffness means a tighter, snappier response.",
      },
      {
        name: "springDamping",
        type: "number",
        defaultValue: "13",
        description:
          "Resistance against the spring. Low damping overshoots and oscillates; high damping settles smoothly with no bounce.",
      },
    ],
  },
];

export const Docs = (): React.ReactElement => {
  return (
    <section className="docs">
      <header className="docs-header">
        <div className="docs-eyebrow-row">
          <p className="docs-eyebrow">Hook</p>
          <div className="docs-link-group">
            <a
              className="docs-repo-link"
              href="https://www.npmjs.com/package/use-springface"
              target="_blank"
              rel="noreferrer noopener"
            >
              <span className="docs-repo-link-icon" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                  <path d="M0 0v16h16V0H0zm13 13h-2V5H8v8H3V3h10v10z" />
                </svg>
              </span>
              <span>use-springface</span>
              <span className="docs-repo-link-arrow" aria-hidden="true">↗</span>
            </a>
            <a
              className="docs-repo-link"
              href="https://github.com/tol-is/springface"
              target="_blank"
              rel="noreferrer noopener"
            >
              <span className="docs-repo-link-icon" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </span>
              <span>tol-is/springface</span>
              <span className="docs-repo-link-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <h2 className="docs-title">useSpringface</h2>
        <p className="docs-lede">
          A React hook that wires pointer physics into variable-font axes.
          Attach a ref to the container, list the axes you want to animate, and
          the hook handles measurement, smoothing, and the chromatic shadow stack
          on every frame.
        </p>
        <pre className="docs-signature">
          <code>{`const rootRef = useRef<HTMLElement>(null);

useSpringface(rootRef, {
  axes: [
    { tag: "wdth", rest: 50,  peak: 120 },
    { tag: "wght", rest: 100, peak: 950 },
  ],
  shadowColors: ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9"],
  shadowStep: 0.02,
  shadowAngle: null,        // null = follow pointer; number = lock to that angle
  maxDistancePx: 200,
  smoothing: 0.15,          // frame-rate-independent
  springStiffness: 220,
  springDamping: 13,
});`}</code>
        </pre>
      </header>

      {groups.map((group) => (
        <div key={group.title} className="docs-group">
          <div className="docs-group-head">
            <h3 className="docs-group-title">{group.title}</h3>
            <p className="docs-group-blurb">{group.blurb}</p>
          </div>

          <ul className="docs-list">
            {group.props.map((prop) => (
              <li key={prop.name} className="docs-row">
                <div className="docs-row-main">
                  <div className="docs-row-name">
                    <span className="docs-prop">{prop.name}</span>
                    <span className="docs-type">{prop.type}</span>
                  </div>
                  <p className="docs-desc">{prop.description}</p>
                </div>
                <div className="docs-row-default">
                  <span className="docs-default-label">default</span>
                  <code className="docs-default-value">{prop.defaultValue}</code>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
};
