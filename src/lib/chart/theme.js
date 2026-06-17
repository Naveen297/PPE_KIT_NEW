/**
 * Centralised Recharts theme — one source of truth for chart colors, axis
 * styling, grid, and cursors so every visualization in the dashboard looks
 * like it belongs to the same enterprise product.
 */

export const CHART = {
  // Sequential brand ramp for single-series emphasis
  brand: '#2459eb',
  brandSoft: '#3b76f6',
  brandFaint: '#dbe8fe',

  // Categorical palette (color-blind-considerate, muted, professional)
  categorical: ['#2459eb', '#0ea5e9', '#14b8a6', '#8b5cf6', '#f59e0b', '#64748b'],

  // Semantic
  positive: '#16a34a',
  warning: '#f59e0b',
  negative: '#ef4444',
  neutral: '#94a3b8',

  // Risk levels
  risk: {
    high: '#ef4444',
    medium: '#f59e0b',
    control: '#16a34a',
  },

  axis: '#8a96ab',
  axisLabel: '#5b667d',
  grid: '#eef1f6',
  surface: '#ffffff',
};

/** Shared axis props for a clean, legible look. */
export const axisProps = {
  tick: { fill: CHART.axisLabel, fontSize: 11, fontWeight: 500 },
  tickLine: false,
  axisLine: { stroke: CHART.grid },
};

/** Cursor styles used on hover. */
export const hoverCursor = { fill: 'rgba(36,89,235,0.06)' };
export const lineCursor = { stroke: '#cbd3e1', strokeWidth: 1, strokeDasharray: '4 4' };
