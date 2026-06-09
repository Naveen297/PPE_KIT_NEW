/**
 * KPI derivations — turns the raw `detections` array into period-over-period
 * trends and sparkline series WITHOUT changing the underlying data structure.
 *
 * Window model: a rolling 14-day view split into two 7-day halves
 * (current vs. previous) so every KPI gets a real, data-driven delta.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

/**
 * @param {Array} detections
 * @returns {{
 *   total:    { value:number, deltaPct:number, series:number[] },
 *   compliant:{ value:number, deltaPct:number, series:number[] },
 *   violations:{ value:number, deltaPct:number, series:number[] },
 *   complianceRate:{ value:number, deltaPoints:number, series:number[] },
 *   windowDays:number,
 * }}
 */
export const computeKpiTrends = (detections = []) => {
  const today = startOfDay(new Date());
  const WINDOW = 14;

  // Daily buckets oldest → newest
  const buckets = Array.from({ length: WINDOW }, () => ({ total: 0, compliant: 0, violations: 0 }));

  detections.forEach((d) => {
    const t = new Date(d.timestamp);
    if (Number.isNaN(t.getTime())) return;
    const dayIdx = Math.floor((today - startOfDay(t)) / DAY_MS); // 0 = today
    if (dayIdx < 0 || dayIdx >= WINDOW) return;
    const b = buckets[WINDOW - 1 - dayIdx];
    b.total += 1;
    if (d.status === 'compliant') b.compliant += 1;
    else if (d.status === 'violation') b.violations += 1;
  });

  const prev = buckets.slice(0, 7);
  const curr = buckets.slice(7);

  const sum = (arr, key) => arr.reduce((s, b) => s + b[key], 0);
  const pctChange = (now, before) => {
    if (before === 0) return now === 0 ? 0 : 100;
    return ((now - before) / before) * 100;
  };

  const totalSeries = buckets.map((b) => b.total);
  const compliantSeries = buckets.map((b) => b.compliant);
  const violationSeries = buckets.map((b) => b.violations);
  const rateSeries = buckets.map((b) => (b.total > 0 ? (b.compliant / b.total) * 100 : 0));

  const currTotal = sum(curr, 'total');
  const prevTotal = sum(prev, 'total');
  const currComp = sum(curr, 'compliant');
  const prevComp = sum(prev, 'compliant');
  const currViol = sum(curr, 'violations');
  const prevViol = sum(prev, 'violations');

  const currRate = currTotal > 0 ? (currComp / currTotal) * 100 : 0;
  const prevRate = prevTotal > 0 ? (prevComp / prevTotal) * 100 : 0;

  return {
    total: { value: detections.length, deltaPct: pctChange(currTotal, prevTotal), series: totalSeries },
    compliant: { value: currComp || sum(buckets, 'compliant'), deltaPct: pctChange(currComp, prevComp), series: compliantSeries },
    violations: { value: currViol || sum(buckets, 'violations'), deltaPct: pctChange(currViol, prevViol), series: violationSeries },
    complianceRate: { value: currRate, deltaPoints: currRate - prevRate, series: rateSeries },
    windowDays: 7,
  };
};
