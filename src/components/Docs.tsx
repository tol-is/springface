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
      "Variable-font axes that respond to cursor proximity. Each axis interpolates between rest and peak; the palette below renders as stacked text-shadows.",
    props: [
      {
        name: "axes",
        type: "Axis[]",
        defaultValue: "required",
        description:
          "List of axes to animate. Each entry is { tag, rest, peak } — for example { tag: 'wght', rest: 100, peak: 950 } drives the weight axis. Changing the tag set re-initializes letter state.",
      },
      {
        name: "shadowColors",
        type: "string[]",
        defaultValue: "required",
        description:
          "Palette used to build the chromatic stack behind each glyph. One layer is rendered per color, in order, scaled by shadowStep.",
      },
    ],
  },
  {
    title: "Shadow",
    blurb:
      "Direction and spacing of the layered text-shadow that trails the cursor.",
    props: [
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
        <p className="docs-eyebrow">Hook</p>
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
