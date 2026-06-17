/** DashboardSkeleton — premium shimmer placeholder shown while data loads. */
const Block = ({ className = '' }) => <div className={`skeleton rounded-lg ${className}`} />;

const CardShell = ({ children }) => (
  <div className="rounded-2xl border border-ink-200/70 bg-white p-5 shadow-card">{children}</div>
);

const DashboardSkeleton = () => (
  <div className="space-y-5" aria-busy="true" aria-label="Loading dashboard">
    {/* KPI row */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardShell key={i}>
          <div className="flex items-center justify-between">
            <Block className="h-10 w-10 rounded-xl" />
            <Block className="h-5 w-12" />
          </div>
          <Block className="mt-4 h-7 w-20" />
          <Block className="mt-2 h-3 w-24" />
          <Block className="mt-4 h-9 w-full" />
        </CardShell>
      ))}
    </div>

    {/* PPE breakdown */}
    <CardShell>
      <Block className="h-4 w-48" />
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Block key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </CardShell>

    {/* Charts */}
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      <div className="xl:col-span-8">
        <CardShell>
          <Block className="h-4 w-44" />
          <Block className="mt-4 h-[248px] w-full rounded-xl" />
        </CardShell>
      </div>
      <div className="xl:col-span-4">
        <CardShell>
          <Block className="h-4 w-36" />
          <Block className="mx-auto mt-4 h-[150px] w-[150px] rounded-full" />
        </CardShell>
      </div>
    </div>

    {/* Table */}
    <CardShell>
      <Block className="h-4 w-40" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Block key={i} className="h-10 w-full" />
        ))}
      </div>
    </CardShell>
  </div>
);

export default DashboardSkeleton;
