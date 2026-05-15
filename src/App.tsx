import React from 'react';
import { useControls, folder } from 'leva';
import './global.css';

import { Type } from './Type';

export default function App(): React.ReactElement {
  const {
    shadowStep,
    maxDistance,
    smoothing,
    shadowLength,
    grayscale,
    shadowMode,
    shadowAngle,
    restWdth,
    peakWdth,
    restWght,
    peakWght,
    springStiffness,
    springDamping,
  } = useControls({
    Shadow: folder({
      shadowStep: { value: 0.02, min: 0, max: 0.1, step: 0.001 },
      shadowLength: { value: 4, min: 0, max: 8, step: 1 },
      grayscale: false,
      shadowMode: { value: 'mouse', options: ['mouse', 'fixed'] as const },
      shadowAngle: { value: 45, min: 0, max: 360, step: 1 },
    }),
    Width: folder({
      restWdth: { value: 50, min: 50, max: 100, step: 1 },
      peakWdth: { value: 120, min: 100, max: 150, step: 1 },
    }),
    Weight: folder({
      restWght: { value: 100, min: 100, max: 950, step: 1 },
      peakWght: { value: 950, min: 100, max: 950, step: 1 },
    }),
    Spring: folder({
      maxDistance: { value: 200, min: 100, max: 300, step: 1 },
      smoothing: { value: 0.15, min: 0, max: 1, step: 0.01 },
      springStiffness: { value: 220, min: 0, max: 1000, step: 1 },
      springDamping: { value: 13, min: 0, max: 100, step: 0.1 },
    }),
  });

  const axes = [
    { tag: 'wdth', rest: restWdth, peak: peakWdth },
    { tag: 'wght', rest: restWght, peak: peakWght },
  ];

  const pastelColors = [
    '#FFB3BA',
    '#FFDFBA',
    '#FFFFBA',
    '#BAFFC9',
    '#BAE1FF',
    '#C9C9FF',
    '#FFBAED',
    '#D4F0F0',
  ];

  const toGray = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 0xff;
    const g = (n >> 8) & 0xff;
    const b = n & 0xff;
    const y = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    const h = y.toString(16).padStart(2, '0');
    return `#${h}${h}${h}`;
  };

  const shadowColors = pastelColors
    .slice(0, shadowLength)
    .map((c) => (grayscale ? toGray(c) : c));

  const lines = ['ART WILL', 'SURVIVE', "ARTISTS WON'T"];

  return (
    <>
      <Type
        lines={lines}
        shadowColors={shadowColors}
        axes={axes}
        shadowStep={shadowStep}
        maxDistance={maxDistance}
        smoothing={smoothing}
        shadowMode={shadowMode as 'mouse' | 'fixed'}
        shadowAngle={shadowAngle}
        springStiffness={springStiffness}
        springDamping={springDamping}
      />
      <a
        href="https://tol.is"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '1vmax',
          right: '1vmax',
          fontSize: '11px',
          color: 'var(--color-text)',
          textDecoration: 'none',
          opacity: 0.5,
        }}
      >
        tol.is
      </a>
    </>
  );
}
