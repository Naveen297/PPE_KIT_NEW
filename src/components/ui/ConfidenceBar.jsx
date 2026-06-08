import { getConfidenceLabel, getConfidenceColor, getConfidenceBgColor } from '@/utils/formatters';

/**
 * A reusable confidence score progress bar.
 *
 * @param {Object}  props
 * @param {number}  props.value        - Confidence percentage (0–100).
 * @param {'sm'|'lg'} [props.size='sm'] - Controls bar height and label visibility.
 * @param {boolean} [props.showLabel=true] - Whether to show the numeric % label.
 */
const ConfidenceBar = ({ value, size = 'sm', showLabel = true }) => {
  const numericValue = parseFloat(value);
  const barHeight = size === 'lg' ? 'h-2.5' : 'h-1.5';
  const label = getConfidenceLabel(numericValue);
  const labelColor = getConfidenceColor(numericValue);
  const fillColor = getConfidenceBgColor(numericValue);

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-gray-200 rounded-full ${barHeight} min-w-[3rem]`}>
        <div
          className={`${barHeight} rounded-full transition-all duration-500 ${fillColor}`}
          style={{ width: `${numericValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-bold text-gray-900 tabular-nums">
          {numericValue}%
        </span>
      )}
      {size === 'lg' && (
        <span className={`text-xs font-semibold ${labelColor}`}>{label}</span>
      )}
    </div>
  );
};

export default ConfidenceBar;
