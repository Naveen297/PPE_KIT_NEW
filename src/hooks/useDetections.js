import { useMemo } from 'react';
import { getDetections } from '@/api';
import useApiResource from './useApiResource';

/**
 * Fetches a page of detections from `GET /api/v1/detections`.
 *
 * @param {Object} params
 * @param {'violation'|'compliant'|'all'} [params.status='violation']
 * @param {number} [params.page=1]
 * @param {number} [params.limit=10]
 * @param {'time'|'area'|'severity'|'confidence'} [params.sortBy='time']
 * @param {'ASC'|'DESC'} [params.sortOrder='DESC']
 * @returns {{ detections, pagination, error, loading, refetch }}
 */
export default function useDetections({
  status = 'violation',
  page = 1,
  limit = 10,
  sortBy = 'time',
  sortOrder = 'DESC',
} = {}) {
  const { data, error, loading, refetch } = useApiResource(
    (signal) =>
      getDetections({ status, page, limit, sortBy, sortOrder }, signal),
    [status, page, limit, sortBy, sortOrder],
  );

  const result = useMemo(
    () => ({
      detections: data?.data ?? [],
      pagination: data?.pagination ?? { page, limit, total: 0, totalPages: 1 },
    }),
    [data, page, limit],
  );

  return { ...result, error, loading, refetch };
}
