import { useState, useCallback } from 'react';
import { Building2, ChevronDown, Check, RadioTower } from 'lucide-react';
import { clsx } from 'clsx';
import { usePlant, useClickOutside } from '@/hooks';

/** Clean plant switcher matching the dashboard design system. */
const PlantPicker = () => {
  const { currentPlant, plants, changePlant } = usePlant();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useClickOutside(close);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-10 items-center gap-2.5 rounded-xl border border-ink-200 bg-white pl-3 pr-2.5 text-left shadow-xs transition-colors hover:bg-ink-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Building2 className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-2xs font-semibold uppercase tracking-wide text-ink-400">Plant</span>
          <span className="block max-w-[160px] truncate text-xs font-bold text-ink-800">{currentPlant.name}</span>
        </span>
        <ChevronDown className={clsx('h-4 w-4 flex-shrink-0 text-ink-400 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>

      {open && (
        <div role="listbox" className="absolute right-0 z-30 mt-2 w-72 origin-top-right animate-scale-in rounded-xl border border-ink-200 bg-white p-1.5 shadow-elevated">
          <p className="px-3 pb-1 pt-2 text-2xs font-bold uppercase tracking-wider text-ink-400">Select plant</p>
          {plants.map((p) => {
            const active = currentPlant.id === p.id;
            return (
              <button
                key={p.id}
                role="option"
                aria-selected={active}
                onClick={() => { changePlant(p.id); setOpen(false); }}
                className={clsx(
                  'flex w-full items-start justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors',
                  active ? 'bg-brand-50' : 'hover:bg-ink-50',
                )}
              >
                <span>
                  <span className={clsx('block text-xs font-semibold', active ? 'text-brand-700' : 'text-ink-700')}>{p.name}</span>
                  <span className="mt-0.5 block text-2xs text-ink-400">{p.location}</span>
                </span>
                {active && <Check className="h-4 w-4 flex-shrink-0 text-brand-600" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * DashboardToolbar — page-title hierarchy + live status + plant switcher.
 *
 * @param {Object} props
 * @param {string} props.lastUpdated - Pre-formatted "last synced" time string.
 */
const DashboardToolbar = ({ lastUpdated }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <div className="flex items-center gap-2.5">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">Safety Overview</h1>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-2xs font-bold uppercase tracking-wide text-emerald-700">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
      </div>
      <p className="mt-1 text-sm text-ink-500">
        Real-time PPE compliance monitoring · AI-powered detection
      </p>
    </div>

    <div className="flex items-center gap-3">
      <span className="hidden items-center gap-1.5 text-2xs font-medium text-ink-400 md:flex">
        <RadioTower className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
        Synced {lastUpdated}
      </span>
      <PlantPicker />
    </div>
  </div>
);

export default DashboardToolbar;
