import { useMemo } from 'react';

/**
 * RiskLevelChart — Pie chart showing distribution of risk levels.
 * Derived from real detections: violations with many missing items = high risk.
 *
 * @param {Object} props
 * @param {Array}  props.detections - Detection records.
 */
const RISK_CONFIG = [
  { type: 'High Risk',     color: '#ef4444', threshold: 2 },   // ≥2 missing items
  { type: 'Medium Risk',   color: '#f59e0b', threshold: 1 },   // 1 missing item
  { type: 'Under Control', color: '#10b981', threshold: 0 },   // compliant
];

const CHART_SIZE   = 140;
const STROKE_WIDTH = 30;
const RADIUS       = (CHART_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const RiskLevelChart = ({ detections }) => {
  const riskCounts = useMemo(() => {
    let high = 0, medium = 0, underControl = 0;
    detections.forEach((d) => {
      const missing = d.missingItems?.length ?? 0;
      if (missing >= 2) high++;
      else if (missing === 1) medium++;
      else underControl++;
    });
    return [high, medium, underControl];
  }, [detections]);

  const total = riskCounts.reduce((s, v) => s + v, 0) || 1;
  let offset = 0;

  return (
    <div className="h-full p-5 bg-white border border-gray-200 shadow-md rounded-2xl">
      <h3 className="mb-2 text-sm font-bold text-gray-800">Level of Risk</h3>
      <p className="mb-4 text-xs text-gray-500">Pie Chart • Unit: Numbers</p>

      <div className="relative w-36 h-36 mx-auto">
        <svg viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`} className="transform -rotate-90">
          {RISK_CONFIG.map(({ type, color }, i) => {
            const pct = riskCounts[i] / total;
            const dash = `${pct * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
            const dashOffset = -offset;
            offset += pct * CIRCUMFERENCE;
            return (
              <circle
                key={type}
                cx={CHART_SIZE / 2}
                cy={CHART_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={color}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={dash}
                strokeDashoffset={dashOffset}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        {RISK_CONFIG.map(({ type, color }, i) => (
          <div key={type} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
              <span className="text-xs font-medium text-gray-700">{type}</span>
            </div>
            <span className="text-xs font-semibold text-gray-800">{riskCounts[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskLevelChart;
