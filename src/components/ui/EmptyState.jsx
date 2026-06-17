import { clsx } from 'clsx';

/**
 * EmptyState — consistent "no data" placeholder for charts, tables, and panels.
 *
 * @param {Object} props
 * @param {React.ComponentType} props.icon - A lucide icon component.
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.action]
 * @param {string} [props.className]
 */
const EmptyState = ({ icon: Icon, title, description, action, className }) => (
  <div
    className={clsx(
      'flex flex-col items-center justify-center gap-2 px-4 py-8 text-center',
      className,
    )}
  >
    {Icon && (
      <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-ink-50 text-ink-400">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
    )}
    <p className="text-sm font-semibold text-ink-700">{title}</p>
    {description && <p className="max-w-xs text-xs text-ink-500">{description}</p>}
    {action && <div className="mt-1">{action}</div>}
  </div>
);

export default EmptyState;
