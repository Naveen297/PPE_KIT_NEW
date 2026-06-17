import { clsx } from 'clsx';

/**
 * Card — the single premium surface primitive used across the dashboard.
 * Guarantees consistent radius, border, shadow, and internal padding so every
 * panel aligns to the same visual system.
 *
 * @param {Object}  props
 * @param {React.ReactNode} props.children
 * @param {boolean} [props.interactive=false] - Adds hover elevation + lift.
 * @param {boolean} [props.flush=false]        - Removes default body padding.
 * @param {string}  [props.className]
 */
export const Card = ({ children, interactive = false, flush = false, className, ...rest }) => (
  <div
    className={clsx(
      'flex h-full flex-col rounded-2xl border border-ink-200/70 bg-white shadow-card',
      interactive &&
        'transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:shadow-card-hover',
      !flush && 'p-5',
      className,
    )}
    {...rest}
  >
    {children}
  </div>
);

/**
 * CardHeader — standardized panel header with title, optional subtitle,
 * leading icon, and a right-aligned actions slot.
 */
export const CardHeader = ({ title, subtitle, icon, actions, iconClassName, className }) => (
  <div className={clsx('flex items-start justify-between gap-3', className)}>
    <div className="flex min-w-0 items-start gap-3">
      {icon && (
        <span
          className={clsx(
            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl',
            iconClassName ?? 'bg-brand-50 text-brand-600',
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <h3 className="truncate font-display text-[0.95rem] font-bold leading-tight text-ink-900">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs font-medium text-ink-500">{subtitle}</p>
        )}
      </div>
    </div>
    {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
  </div>
);

export default Card;
