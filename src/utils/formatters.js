/**
 * Centralised display-formatting utilities.
 * All pure functions — no side-effects, no React dependencies.
 */

/**
 * Formats an ISO / locale timestamp string for human-readable display.
 * @param {string|Date} timestamp
 * @returns {string}
 */
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

/**
 * Returns a human label for a time period key.
 * @param {'daily'|'weekly'|'monthly'} period
 * @returns {string}
 */
export const getTimePeriodLabel = (period) => {
  const labels = {
    daily: 'Today',
    weekly: 'Last 7 Days',
    monthly: 'Last 30 Days',
  };
  return labels[period] ?? period;
};

/**
 * Maps a confidence score (0–100) to a qualitative label.
 * @param {number} value
 * @returns {'Excellent'|'Good'|'Fair'}
 */
export const getConfidenceLabel = (value) => {
  if (value >= 90) return 'Excellent';
  if (value >= 75) return 'Good';
  return 'Fair';
};

/**
 * Returns the Tailwind colour class for a given confidence score.
 * @param {number} value
 * @returns {string} Tailwind text-colour class
 */
export const getConfidenceColor = (value) => {
  if (value >= 90) return 'text-green-600';
  if (value >= 75) return 'text-orange-500';
  return 'text-red-600';
};

/**
 * Returns the Tailwind background colour class for a confidence bar fill.
 * @param {number} value
 * @returns {string} Tailwind bg-colour class
 */
export const getConfidenceBgColor = (value) => {
  if (value >= 90) return 'bg-green-500';
  if (value >= 75) return 'bg-orange-500';
  return 'bg-red-500';
};
