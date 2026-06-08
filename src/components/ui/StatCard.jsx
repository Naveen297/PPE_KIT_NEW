/**
 * A single KPI stat card for the dashboard.
 *
 * @param {Object}  props
 * @param {string}  props.title      - Card label.
 * @param {string|number} props.value - The displayed metric.
 * @param {string}  props.gradient   - Tailwind gradient classes for the icon bg.
 * @param {string}  props.bgColor    - Tailwind bg class for the card background.
 * @param {string}  props.borderColor - Tailwind border class.
 * @param {React.ReactNode} props.icon - SVG icon element.
 * @param {string}  [props.valueColor] - Optional Tailwind text colour for value.
 * @param {boolean} [props.showTrend=false] - Whether to show trend arrow.
 * @param {boolean} [props.trendUp=true]    - Direction of the trend arrow.
 */
const StatCard = ({
  title,
  value,
  gradient,
  bgColor,
  borderColor,
  icon,
  valueColor,
  showTrend = false,
  trendUp = true,
}) => (
  <div className={`${bgColor} ${borderColor} border-2 p-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300`}>
    <div className="flex items-center gap-3">
      <div className={`bg-gradient-to-br ${gradient} w-8 h-8 rounded-lg flex items-center justify-center shadow-md flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0 text-xs font-semibold text-gray-600">{title}</div>
      <div className="flex items-center gap-1.5">
        <div className={`text-xl font-bold ${valueColor ?? 'text-gray-800'}`}>{value}</div>
        {showTrend && (
          <div className="flex-shrink-0">
            {trendUp ? (
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default StatCard;
