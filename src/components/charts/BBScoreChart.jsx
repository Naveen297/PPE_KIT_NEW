/**
 * BBScoreChart — Gauge showing Behavior Based Safety (BBS) Score.
 * SA = Safe Acts (compliant), UA = Unsafe Acts (violations).
 *
 * @param {Object} props
 * @param {Array}  props.detections - Detection records.
 */
import { useMemo } from 'react';

const BBScoreChart = ({ detections }) => {
  const { sa, ua } = useMemo(() => {
    const total = detections.length || 1;
    const compliant = detections.filter((d) => d.status === 'compliant').length;
    return {
      sa: Math.round((compliant / total) * 100),
      ua: Math.round(((total - compliant) / total) * 100),
    };
  }, [detections]);

  const uaPct = ua;
  const saPct = sa;

  return (
    <div className="h-full p-5 shadow-md bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl">
      <h3 className="mb-2 text-sm font-bold text-white">BBS Score</h3>
      <p className="mb-4 text-xs text-gray-300">Gauge Chart • Behavior Based Safety • Unit: %</p>

      <div className="relative w-40 h-40 mx-auto">
        <svg viewBox="0 0 160 160" className="transform -rotate-90">
          <circle cx="80" cy="80" r="60" fill="none" stroke="#1e3a5f" strokeWidth="35"
            strokeDasharray={`${uaPct * 3.77} 377`} className="transition-all duration-500" />
          <circle cx="80" cy="80" r="60" fill="none" stroke="#f59e0b" strokeWidth="35"
            strokeDasharray={`${saPct * 3.77} 377`} strokeDashoffset={`-${uaPct * 3.77}`}
            className="transition-all duration-500" />
          <line x1="80" y1="80" x2="80" y2="30" stroke="#f59e0b" strokeWidth="3"
            strokeLinecap="round" className="transition-all duration-500"
            style={{ transform: `rotate(${(uaPct / 100) * 180}deg)`, transformOrigin: '80px 80px' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-3xl font-bold text-white">{ua}</div>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-3">
        {[{ label: `UA: ${ua}%`, color: 'bg-blue-900' }, { label: `SA: ${sa}%`, color: 'bg-orange-500' }].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 ${color} rounded-full`} />
            <span className="text-xs font-medium text-white">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BBScoreChart;
