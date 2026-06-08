/**
 * A PPE item chip/tag that signals presence or absence of an item.
 *
 * @param {Object} props
 * @param {string} props.label    - The PPE item name to display.
 * @param {'present'|'missing'} [props.variant='present'] - Visual variant.
 */
const PPEItemChip = ({ label, variant = 'present' }) => {
  const isPresent = variant === 'present';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${
        isPresent
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700'
      }`}
    >
      {isPresent ? (
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {label}
    </span>
  );
};

export default PPEItemChip;
