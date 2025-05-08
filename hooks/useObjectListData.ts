import {
  cacheObjectDetailById,
  getCachedObjectDetailById,
  useObjectListCache
} from '@/context/object-list-cache-context';
import { fetchObjectDetails, fetchObjectIds, searchObjects } from '@/lib/api/met-api';
import type { Department, ObjectDetails } from '@/lib/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const OBJECTS_PER_PAGE = 25;

export interface UseObjectListDataResult {
  departments: Department[];
  objectDetails: (ObjectDetails | { notFound: true })[];
  totalObjects: number;
  fetchError: string | null;
  isLoading: boolean;
  notFound: boolean;
  cacheKey: {
    page: number;
    departmentId?: number;
    q?: string;
    hasImages?: boolean;
    searchBy?: string;
    isHighlight?: boolean;
    openAccess?: boolean;
  };
  validObjectDetails: ObjectDetails[];
  setSearchQuery: (q: string) => void;
  setSearchByValue: (v: string) => void;
  searchQuery: string;
  searchByValue: string;
  prefetchPage: (targetPage: number) => Promise<void>;
  prefetchObjectDetail: (objectID: number) => Promise<void>;
}

export function useObjectListData({
  page,
  departmentId,
  searchQuery: propSearchQuery,
  hasImages: propHasImages,
  searchByValue: propSearchByValue,
  isOnView,
  isPublicDomain,
  isHighlight,
  openAccess
}: {
  page: number;
  departmentId?: number;
  searchQuery: string;
  hasImages?: boolean;
  searchByValue: string;
  isOnView?: boolean;
  isPublicDomain?: boolean;
  isHighlight?: boolean;
  openAccess?: boolean;
}): Omit<UseObjectListDataResult, 'departments' | 'setSearchQuery' | 'setSearchByValue'> {
  const { getCacheEntry, setCacheEntry } = useObjectListCache();

  const [objectDetails, setObjectDetails] = useState<(ObjectDetails | { notFound: true })[]>([]);
  const [totalObjects, setTotalObjects] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  /** Compute hasImages from props and initial values */
  let hasImages: boolean | undefined = undefined;
  if (typeof propHasImages === 'boolean') {
    hasImages = propHasImages;
  }

  const cacheKeyObj = useMemo(() => {
    const key: {
      page: number;
      departmentId?: number;
      q?: string;
      hasImages?: boolean;
      searchBy?: string;
      isHighlight?: boolean;
      openAccess?: boolean;
    } = { page };
    if (typeof departmentId === 'number' && departmentId > 0) key.departmentId = departmentId;
    if (typeof propSearchQuery === 'string') key.q = propSearchQuery;
    if (typeof hasImages === 'boolean') key.hasImages = hasImages;
    if (typeof propSearchByValue === 'string' && propSearchByValue !== 'all') key.searchBy = propSearchByValue;
    if (typeof isHighlight === 'boolean') key.isHighlight = isHighlight;
    if (typeof openAccess === 'boolean') key.openAccess = openAccess;

    return key;
  }, [page, departmentId, propSearchQuery, hasImages, propSearchByValue, isHighlight, openAccess]);

  /** Fetch/cached object list */
  useEffect(() => {
    /** Even if search query is empty, we will fetch everything when needed */
    if (!propSearchQuery || propSearchQuery.trim() === '') {
      /** Don't clear data automatically - only if explicitly searching with empty query */
      if (propSearchQuery === '') {
        setObjectDetails([]);
        setTotalObjects(0);
        setIsLoading(false);
        setFetchError(null);
        setNotFound(false);

        return;
      }

      /** Otherwise, keep existing results */
      return;
    }

    setIsLoading(true);
    setFetchError(null);
    setNotFound(false);

    const cached = getCacheEntry(cacheKeyObj);

    if (cached) {
      /** Check if we actually have object details in the cache */
      const hasValidDetails = cached.objectDetails.length > 0;

      if (hasValidDetails) {
        /** If cache has valid details, use them */
        setObjectDetails(cached.objectDetails);
        setTotalObjects(cached.totalObjects);
        setIsLoading(false);

        return;
      }
        /** If cache has a total but no details, need to fetch details */
        setTotalObjects(cached.totalObjects);
    }

    (async () => {
      try {
        let objectIds: number[] | null = null;
        let total = 0;
        let details: (ObjectDetails | { notFound: true })[] = [];

        if (propSearchByValue === 'objectId' && propSearchQuery && /^\d+$/.test(propSearchQuery.trim())) {
          const objectId = Number(propSearchQuery.trim());
          const cachedDetailRaw = getCachedObjectDetailById(objectId);
          const cachedDetail: ObjectDetails | undefined =
            cachedDetailRaw && typeof cachedDetailRaw === 'object' && !('notFound' in cachedDetailRaw)
              ? cachedDetailRaw
              : undefined;
          let object = cachedDetail;

          if (!object) {
            const fetched = await fetchObjectDetails(objectId, { cache: 'force-cache' });

            object = fetched && !('notFound' in fetched) ? fetched : undefined;

            if (object) {
              cacheObjectDetailById(objectId, object);
            } else if (fetched && 'notFound' in fetched) {
              cacheObjectDetailById(objectId, fetched);
            }
          }

          if (object) {
            details = [object];
            objectIds = [objectId];
            total = 1;
          } else if (!object) {
            details = [{ notFound: true } as const];
            objectIds = [];
            total = 0;

            setNotFound(true);
          }
        } else if (
          propSearchQuery ||
          hasImages ||
          isOnView !== undefined ||
          isPublicDomain !== undefined ||
          openAccess !== undefined
        ) {
          const searchParams = {
            /** Use '*' as a fallback when search query is empty */
            /** This searches for everything */
            q: propSearchQuery?.trim() || '*',
            ...(typeof departmentId === 'number' ? { departmentId } : {}),
            ...(typeof hasImages === 'boolean' ? { hasImages } : {}),
            ...(typeof isOnView === 'boolean' ? { isOnView } : {}),
            ...(typeof isPublicDomain === 'boolean' ? { isPublicDomain } : {}),
            ...(typeof isHighlight === 'boolean' ? { isHighlight } : {}),
            ...(typeof openAccess === 'boolean' ? { openAccess } : {})
          };

          const searchResults = await searchObjects(searchParams, { cache: 'force-cache' });

          objectIds = searchResults.objectIDs;
          total = searchResults.total;

          /** Fetch details for the current page of results */
          if (objectIds && objectIds.length > 0) {
            const startIndex = (page - 1) * OBJECTS_PER_PAGE;
            const endIndex = startIndex + OBJECTS_PER_PAGE;
            const pageIds = objectIds.slice(startIndex, endIndex);

            details = await Promise.all(
              pageIds.map(id => {
                const cachedDetailRaw = getCachedObjectDetailById(id);
                const cachedDetail =
                  cachedDetailRaw && typeof cachedDetailRaw === 'object' && !('notFound' in cachedDetailRaw)
                    ? cachedDetailRaw
                    : undefined;

                if (cachedDetail) {
                  return Promise.resolve(cachedDetail);
                }

                return fetchObjectDetails(id, { cache: 'force-cache' })
                  .then(detail => {
                    if (detail && !('notFound' in detail)) {
                      cacheObjectDetailById(id, detail);

                      return detail;
                    }

                    return { notFound: true } as const;
                  })
                  .catch(_error => {
                    return { notFound: true } as const;
                  });
              })
            );
            /** IMPORTANT: Directly update state after fetching */
            setObjectDetails(details);
            setTotalObjects(total);
          }
        }

        if (details.length === 0 && objectIds && objectIds.length > 0) {
          const startIndex = (page - 1) * OBJECTS_PER_PAGE;
          const endIndex = startIndex + OBJECTS_PER_PAGE;
          const pageIds = objectIds.slice(startIndex, endIndex);

          const fetchedDetails = await Promise.all(
            pageIds.map(id => {
              return fetchObjectDetails(id, { cache: 'force-cache' })
                .then(detail => {
                  if (detail && !('notFound' in detail)) {
                    cacheObjectDetailById(id, detail);

                    return detail;
                  }

                  return { notFound: true } as const;
                })
                .catch(() => ({ notFound: true }) as const);
            })
          );

          /** Update with the fetched details */
          details = fetchedDetails;
        }

        setObjectDetails(details);
        setTotalObjects(total);

        /** IMPORTANT: Only cache when we actually have the details */
        const cacheData = {
          objectDetails: details,
          totalObjects: total
        };

        setCacheEntry(cacheKeyObj, cacheData);
      } catch (err: unknown) {
        setFetchError(err instanceof Error ? err.message : 'Failed to load objects.');
        setObjectDetails([]);
        setTotalObjects(0);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [
    getCacheEntry,
    page,
    departmentId,
    propSearchQuery,
    hasImages,
    propSearchByValue,
    setCacheEntry,
    cacheKeyObj,
    isOnView,
    isPublicDomain,
    isHighlight,
    openAccess
  ]);

  /** Filtered objectDetails ready for rendering and interaction */
  const validObjectDetails = useMemo(() => {
    const filtered = objectDetails.filter((object): object is ObjectDetails => !('notFound' in object));

    return isOnView
      ? filtered.filter(
          object =>
            typeof object.GalleryNumber === 'string' &&
            object.GalleryNumber.trim() !== '' &&
            object.GalleryNumber !== '0'
        )
      : filtered;
  }, [objectDetails, isOnView]);

  /** Prefetch logic */
  const prefetchDetailCache = useRef<Map<number, ObjectDetails>>(new Map());
  const prefetchObjectDetail = useCallback(async (objectID: number) => {
    if (prefetchDetailCache.current.has(objectID)) return;

    try {
      const detail = await fetchObjectDetails(objectID, { cache: 'force-cache' });
      if (detail && !('notFound' in detail)) {
        prefetchDetailCache.current.set(objectID, detail as ObjectDetails);
        cacheObjectDetailById(objectID, detail as ObjectDetails);
      }
    } catch {}
  }, []);

  const prefetchPage = useCallback(
    async (targetPage: number) => {
      const prefetchKey: {
        page: number;
        departmentId?: number;
        q?: string;
        hasImages?: boolean;
        openAccess?: boolean;
      } = {
        page: targetPage
      };
      if (typeof departmentId === 'number' && departmentId > 0) prefetchKey.departmentId = departmentId;
      if (typeof propSearchQuery === 'string') prefetchKey.q = propSearchQuery;
      if (typeof hasImages === 'boolean') prefetchKey.hasImages = hasImages;
      if (typeof openAccess === 'boolean') prefetchKey.openAccess = openAccess;
      if (getCacheEntry(cacheKeyObj)) return;

      try {
        let objectIds: number[] | null = null;
        let total = 0;
        if (
          propSearchQuery ||
          hasImages ||
          isOnView !== undefined ||
          isPublicDomain !== undefined ||
          openAccess !== undefined
        ) {
          const searchResults = await searchObjects(
            {
              q: propSearchQuery || '*',
              ...(typeof departmentId === 'number' ? { departmentId } : {}),
              ...(typeof hasImages === 'boolean' ? { hasImages } : {}),
              ...(typeof isOnView === 'boolean' ? { isOnView } : {}),
              ...(typeof isPublicDomain === 'boolean' ? { isPublicDomain } : {}),
              ...(typeof isHighlight === 'boolean' ? { isHighlight } : {}),
              ...(typeof openAccess === 'boolean' ? { openAccess } : {})
            },
            { cache: 'force-cache' }
          );
          objectIds = searchResults.objectIDs;
          total = searchResults.total;
        } else {
          const objectIdData = await fetchObjectIds({
            departmentIds: typeof departmentId === 'number' ? departmentId : undefined
          });
          objectIds = objectIdData.objectIDs;
          total = objectIdData.total;
        }
        if (Array.isArray(objectIds)) {
          const startIndex = (targetPage - 1) * OBJECTS_PER_PAGE;
          const endIndex = startIndex + OBJECTS_PER_PAGE;
          const paginatedIds = objectIds.slice(startIndex, endIndex);
          const details = await Promise.all(
            paginatedIds.map(id => {
              const cachedDetailRaw = getCachedObjectDetailById(id);
              const cachedDetail: ObjectDetails | undefined =
                cachedDetailRaw && typeof cachedDetailRaw === 'object' && !('notFound' in cachedDetailRaw)
                  ? cachedDetailRaw
                  : undefined;
              if (cachedDetail) return Promise.resolve(cachedDetail);
              return fetchObjectDetails(id, { cache: 'force-cache' })
                .then(detail => {
                  if (detail && !('notFound' in detail)) {
                    cacheObjectDetailById(id, detail);
                    return detail;
                  }
                  // If not found, return a marker object
                  return { notFound: true } as const;
                })
                .catch(() => ({ notFound: true }) as const);
            })
          );
          const validDetails = details.filter(
            (d): d is ObjectDetails =>
              d !== undefined && d !== null && typeof d === 'object' && !('notFound' in d) && 'objectID' in d
          );
          setCacheEntry(cacheKeyObj, { objectDetails: validDetails, totalObjects: total });
        } else {
          setCacheEntry(cacheKeyObj, { objectDetails: [], totalObjects: 0 });
        }
      } catch {}
    },
    [
      departmentId,
      propSearchQuery,
      hasImages,
      getCacheEntry,
      setCacheEntry,
      isOnView,
      isPublicDomain,
      cacheKeyObj,
      isHighlight,
      openAccess
    ]
  );

  return {
    objectDetails,
    totalObjects,
    fetchError,
    isLoading,
    notFound,
    cacheKey: cacheKeyObj,
    validObjectDetails,
    searchQuery: propSearchQuery,
    searchByValue: propSearchByValue,
    prefetchPage,
    prefetchObjectDetail
  };
}
