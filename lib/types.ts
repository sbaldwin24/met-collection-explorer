import type { z } from 'zod';
import type { departmentSchema, objectDetailsSchema, searchParamsSchema } from './schemas';

export type Department = z.infer<typeof departmentSchema>;
export type ObjectDetails = z.infer<typeof objectDetailsSchema>;
export type SearchParams = z.infer<typeof searchParamsSchema>;

export type Filter = { key: string; label: string };

export interface ObjectListCacheParams {
  page: number;
  departmentId?: number;
  q?: string;
  hasImages?: boolean;
  isOnView?: boolean;
  isPublicDomain?: boolean;
  isHighlight?: boolean;
}

export interface ObjectListCacheEntryData {
  objectDetails: (ObjectDetails | { notFound: true })[];
  totalObjects: number;
}
