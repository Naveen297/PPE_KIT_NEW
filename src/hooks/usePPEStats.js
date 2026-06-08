import { useMemo } from 'react';

/**
 * Computes per-PPE-item violation counts from a detections array.
 * Memoized on `detections` reference — avoids recomputing on every render.
 *
 * Fixes bug: mobile was previously counted twice (once from ppeItems, once
 * from missingItems in the same loop).
 *
 * @param {Array} detections - Detection records from PlantContext.
 * @returns {{ helmet, gloves, apron, mobile, shoes, goggles }} counts
 */
const usePPEStats = (detections = []) => {
  const itemCounts = useMemo(() => {
    const counts = {
      helmet: 0,
      gloves: 0,
      apron: 0,
      mobile: 0,
      shoes: 0,
      goggles: 0,
    };

    detections.forEach((d) => {
      // Count missing PPE items (violations)
      d.missingItems?.forEach((item) => {
        const lower = item.toLowerCase();
        if (lower.includes('helmet') || lower.includes('hat')) counts.helmet++;
        if (lower.includes('glove')) counts.gloves++;
        if (lower.includes('vest') || lower.includes('apron')) counts.apron++;
        if (lower.includes('boot') || lower.includes('shoe')) counts.shoes++;
        if (lower.includes('goggle') || lower.includes('glass')) counts.goggles++;
        // Mobile phone counted from missingItems only (not ppeItems) to avoid double-count
        if (lower.includes('mobile') || lower.includes('phone')) counts.mobile++;
      });
    });

    return counts;
  }, [detections]);

  return itemCounts;
};

export default usePPEStats;
