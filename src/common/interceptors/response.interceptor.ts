// src/common/interceptors/response.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginationResult } from 'src/utils/types/pagination-result.interface';

const API_VERSION = '0.1.1';

type MetaShape = {
  totalItems: number | string;
  itemsPerPage: number | string;
  currentPage: number | string;
  totalPages: number | string;
};

function isNumberLike(v: unknown): v is number | `${number}` {
  return (
    (typeof v === 'number' && !Number.isNaN(v)) ||
    (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v)))
  );
}

function isPaginationResult<T = any>(val: any): val is PaginationResult<T> {
  // Acepta números o strings numéricos
  return (
    val &&
    typeof val === 'object' &&
    Array.isArray(val.data) &&
    val.meta &&
    isNumberLike((val.meta as MetaShape).totalItems) &&
    isNumberLike((val.meta as MetaShape).itemsPerPage) &&
    isNumberLike((val.meta as MetaShape).currentPage) &&
    isNumberLike((val.meta as MetaShape).totalPages)
  );
}

function toNumber(n: number | string): number {
  return typeof n === 'number' ? n : Number(n);
}

function normalizeMeta(meta: MetaShape) {
  return {
    totalItems: toNumber(meta.totalItems),
    itemsPerPage: toNumber(meta.itemsPerPage),
    currentPage: toNumber(meta.currentPage),
    totalPages: toNumber(meta.totalPages),
  };
}

function buildLink(baseUrl: string, page: number | null): string | null {
  if (page === null) return null;
  const url = new URL(baseUrl, 'http://dummy');
  const searchParams = new URLSearchParams(url.search);
  searchParams.set('page', String(page));
  url.search = `?${searchParams.toString()}`;
  return url.pathname + url.search;
}

function computeLinks(req: any, meta: { currentPage: number; totalPages: number }) {
  const originalUrl: string = req.originalUrl || req.url || '/';
  const url = new URL(originalUrl, 'http://dummy');
  const pathname = url.pathname;
  const query = url.search;
  const baseUrl = pathname + query;

  const { currentPage, totalPages } = meta;

  const first = buildLink(baseUrl, 1);
  const last = buildLink(baseUrl, totalPages);
  const previous = buildLink(baseUrl, currentPage > 1 ? currentPage - 1 : null);
  const next = buildLink(baseUrl, currentPage < totalPages ? currentPage + 1 : null);
  const current = buildLink(baseUrl, currentPage)!;

  return { first, previous, current, next, last };
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const requestId =
      req.headers['x-request-id'] ??
      req.headers['x-requestid'] ??
      undefined;

    return next.handle().pipe(
      map((payload) => {
        if (isPaginationResult(payload)) {
          const meta = normalizeMeta(payload.meta as MetaShape);
          const links = computeLinks(req, meta);

          return {
            apiVersion: API_VERSION,
            timestamp: new Date().toISOString(),
            ...(requestId ? { requestId } : {}),
            data: payload.data, 
            meta,              
            links,
          };
        }
        return {
          apiVersion: API_VERSION,
          timestamp: new Date().toISOString(),
          ...(requestId ? { requestId } : {}),
          data: payload,
        };
      }),
    );
  }
}
