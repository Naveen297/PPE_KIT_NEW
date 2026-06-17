import { clsx } from 'clsx';
import { AlertTriangle, Loader2, ServerCrash, RefreshCw } from 'lucide-react';

/** Centered spinner used while a resource is loading. */
const LoadingBox = ({ className }) => (
  <div className={clsx('flex h-full w-full items-center justify-center', className)}>
    <Loader2 className="h-6 w-6 animate-spin text-brand-500" aria-hidden="true" />
    <span className="sr-only">Loading…</span>
  </div>
);

/** Error panel with a retry affordance; tailored copy for network failures. */
const ErrorBox = ({ error, onRetry, className }) => {
  const isNetwork = error?.isNetwork || error?.code === 'NETWORK_ERROR';
  const Icon = isNetwork ? ServerCrash : AlertTriangle;
  return (
    <div
      className={clsx(
        'flex h-full w-full flex-col items-center justify-center gap-2 px-4 py-6 text-center',
        className,
      )}
      role="alert"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold text-ink-700">
        {isNetwork ? 'Backend unreachable' : 'Could not load data'}
      </p>
      <p className="max-w-xs text-xs text-ink-500">
        {error?.message || 'Something went wrong while fetching this data.'}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-xs transition-colors hover:bg-ink-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
};

/**
 * DataState — declarative loading / error / empty wrapper for async content.
 * Render order: loading → error → empty → children.
 *
 * @param {Object} props
 * @param {boolean} props.loading
 * @param {Error|null} props.error
 * @param {() => void} [props.onRetry]
 * @param {boolean} [props.empty]
 * @param {React.ReactNode} [props.emptyState] - Shown when `empty` is true.
 * @param {string} [props.className]           - Applied to loading/error boxes.
 * @param {React.ReactNode} props.children
 */
const DataState = ({
  loading,
  error,
  onRetry,
  empty = false,
  emptyState = null,
  className,
  children,
}) => {
  if (loading) return <LoadingBox className={className} />;
  if (error) return <ErrorBox error={error} onRetry={onRetry} className={className} />;
  if (empty) return emptyState;
  return children;
};

export default DataState;
