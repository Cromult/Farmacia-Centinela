// src/utils/types/pagination-result.interface.ts
export interface PaginationMeta {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

export interface PaginationLinks {
  first: string | null;
  previous: string | null;
  current: string;
  next: string | null;
  last: string | null;
}

export interface PaginationResult<T> {
  data: T[];
  meta: PaginationMeta;
  links?: PaginationLinks;
}
