import { HardHat, Hand, Shirt, Smartphone, Footprints, Glasses, Layers } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui';

/**
 * PPEBreakdownRow — per-PPE-item violation counts presented as enterprise tiles
 * with contextual share-of-total bars. Data (itemCounts) is unchanged.
 */
const PPE_DISPLAY_ITEMS = [
  { key: 'helmet', label: 'Helmet', Icon: HardHat },
  { key: 'gloves', label: 'Gloves', Icon: Hand },
  { key: 'apron', label: 'Vest / Apron', Icon: Shirt },
  { key: 'mobile', label: 'Mobile', Icon: Smartphone },
  { key: 'shoes', label: 'Safety Shoes', Icon: Footprints },
  { key: 'goggles', label: 'Goggles', Icon: Glasses },
];

const PPEBreakdownRow = ({ itemCounts }) => {
  const counts = PPE_DISPLAY_ITEMS.map(({ key }) => itemCounts[key] ?? 0);
  const max = Math.max(...counts, 1);
  const total = counts.reduce((s, v) => s + v, 0);

  return (
    <Card>
      <CardHeader
        title="PPE Violations by Item"
        subtitle={`${total} flagged equipment gaps across all zones`}
        icon={<Layers className="h-[18px] w-[18px]" />}
      />
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {PPE_DISPLAY_ITEMS.map(({ key, label, Icon }) => {
          const count = itemCounts[key] ?? 0;
          const pct = Math.round((count / max) * 100);
          const share = total > 0 ? Math.round((count / total) * 100) : 0;
          const isTop = count === max && count > 0;

          return (
            <div
              key={key}
              className="group flex flex-col gap-2.5 rounded-xl border border-ink-200/70 bg-ink-50/40 p-3 transition-colors duration-200 hover:border-brand-200 hover:bg-white"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-ink-500 shadow-xs ring-1 ring-ink-200/70 transition-colors group-hover:text-brand-600">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="tnum font-display text-xl font-extrabold leading-none text-ink-900">
                  {count}
                </span>
              </div>

              <div>
                <p className="truncate text-2xs font-bold uppercase tracking-wide text-ink-500">
                  {label}
                </p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-200/70">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out-expo ${
                      isTop ? 'bg-rose-500' : 'bg-brand-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 text-2xs font-medium text-ink-400">{share}% of gaps</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default PPEBreakdownRow;
