/**
 * PPEBreakdownRow — 6-item grid showing per-PPE-item violation counts.
 *
 * @param {Object} props
 * @param {{ helmet, gloves, apron, mobile, shoes, goggles }} props.itemCounts
 */
const PPE_DISPLAY_ITEMS = [
  { key: 'helmet', label: 'Helmet',  icon: '⛑️', styles: 'bg-red-50 border-red-200 text-red-700' },
  { key: 'gloves', label: 'Gloves',  icon: '🧤', styles: 'bg-blue-50 border-blue-200 text-blue-700' },
  { key: 'apron',  label: 'Apron',   icon: '🦺', styles: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  { key: 'mobile', label: 'Mobile',  icon: '📱', styles: 'bg-purple-50 border-purple-200 text-purple-700' },
  { key: 'shoes',  label: 'Shoes',   icon: '👢', styles: 'bg-green-50 border-green-200 text-green-700' },
  { key: 'goggles',label: 'Goggles', icon: '🥽', styles: 'bg-orange-50 border-orange-200 text-orange-700' },
];

const PPEBreakdownRow = ({ itemCounts }) => (
  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
    {PPE_DISPLAY_ITEMS.map(({ key, label, icon, styles }) => (
      <div
        key={key}
        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md cursor-default ${styles}`}
      >
        <div className="mb-1 text-2xl filter drop-shadow-sm">{icon}</div>
        <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</div>
        <div className="mt-0.5 text-xl font-black">{itemCounts[key] ?? 0}</div>
        <div className="text-[9px] font-medium opacity-70">Violations</div>
      </div>
    ))}
  </div>
);

export default PPEBreakdownRow;
