import { PaginationLinks, PaginationMeta } from './pagination-result.interface';

export function buildPaginationLinks(
  baseUrl: string,
  meta: PaginationMeta,
  page: number,
  limit: number,
): PaginationLinks {
  return {
    first: `${baseUrl}?page=1&limit=${limit}`,
    previous: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
    current: `${baseUrl}?page=${page}&limit=${limit}`,
    next:
      page < meta.totalPages
        ? `${baseUrl}?page=${page + 1}&limit=${limit}`
        : null,
    last: `${baseUrl}?page=${meta.totalPages}&limit=${limit}`,
  };
}
