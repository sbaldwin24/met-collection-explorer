'use client';

import { useObjectListCache } from '@/context/object-list-cache-context';
import { useObjectListData } from '@/hooks/useObjectListData';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import ObjectGrid from './object-grid';
import PaginationControls from './pagination-controls';
import SearchBar from './search-bar';
import { Skeleton } from './ui/skeleton';

export interface ObjectListPageClientProps {
  initialQuery?: string;
  initialDepartmentIds?: number[];
  initialSearchBy?: string;
  initialHasImages?: boolean;
  initialIsOnView?: boolean;
  initialOpenAccess?: boolean;
  initialIsPublicDomain?: boolean;
  initialIsHighlight?: boolean;
  filters: {
    highlights: boolean;
    hasImages: boolean;
    onDisplay: boolean;
    openAccess: boolean;
  };
  currentDepartmentId: string;
}

export default function ObjectListPageClient({
  initialQuery = '',
  initialDepartmentIds = [],
  initialSearchBy = 'all',
  filters,
  currentDepartmentId,
  initialHasImages,
  initialIsOnView,
  initialIsPublicDomain,
  initialIsHighlight
}: ObjectListPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  /** Fetch total departments (only needed once) */
  const [departmentOptions, setDepartmentOptions] = useState<Array<{ departmentId: number; displayName: string }>>([]);
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        /** For simplicity, hardcoding common departments or fetch them from API */
        const departments = [
          { departmentId: 1, displayName: 'American Decorative Arts' },
          { departmentId: 3, displayName: 'Ancient Near Eastern Art' },
          { departmentId: 4, displayName: 'Arms and Armor' },
          { departmentId: 5, displayName: 'Arts of Africa, Oceania, and the Americas' },
          { departmentId: 6, displayName: 'Asian Art' },
          { departmentId: 7, displayName: 'The Cloisters' },
          { departmentId: 8, displayName: 'The Costume Institute' },
          { departmentId: 9, displayName: 'Drawings and Prints' },
          { departmentId: 10, displayName: 'Egyptian Art' },
          { departmentId: 11, displayName: 'European Paintings' },
          { departmentId: 12, displayName: 'European Sculpture and Decorative Arts' },
          { departmentId: 13, displayName: 'Greek and Roman Art' },
          { departmentId: 14, displayName: 'Islamic Art' },
          { departmentId: 15, displayName: 'The Robert Lehman Collection' },
          { departmentId: 16, displayName: 'The Libraries' },
          { departmentId: 17, displayName: 'Medieval Art' },
          { departmentId: 18, displayName: 'Musical Instruments' },
          { departmentId: 19, displayName: 'Photographs' },
          { departmentId: 21, displayName: 'Modern Art' }
        ];
        setDepartmentOptions(departments);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  /** Add state for searchBy and query */
  const [searchBy, setSearchBy] = useState(initialSearchBy);
  const [query, setQuery] = useState(initialQuery);

  /** Track current page in state, initialize from URL or default to 1 */
  const initialPage = Number(searchParams.get('page')) || 1;
  const [page, setPage] = useState(initialPage);

  /** Use the data hook */
  const { totalObjects, fetchError, isLoading, validObjectDetails } = useObjectListData({
    page,
    departmentId: initialDepartmentIds.length === 1 ? Number(initialDepartmentIds[0]) : undefined,
    searchQuery: query,
    hasImages: initialHasImages,
    searchByValue: searchBy,
    isOnView: initialIsOnView,
    isPublicDomain: initialIsPublicDomain,
    isHighlight: initialIsHighlight
  });

  /** Handle search submission (controlled SearchBar expects (q, by)) */
  const handleSearchSubmit = useCallback(
    (q: string, by: string) => {
      setQuery(q);
      setSearchBy(by);
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (by && by !== 'all') params.set('by', by);
      if (initialDepartmentIds.length === 1) params.set('departmentId', initialDepartmentIds[0].toString());
      params.set('page', '1'); // Reset to page 1 on new search
      router.push(`/?${params.toString()}`);
    },
    [router, initialDepartmentIds]
  );

  /** Update page state when URL changes */
  useEffect(() => {
    const urlPage = Number(searchParams.get('page')) || 1;

    setPage(urlPage);
  }, [searchParams]);

  /** Add context for scroll/page restoration  */
  const { lastPage, setLastPage, setLastClickedIndex, getScrollPosition, setScrollPosition } = useObjectListCache();

  useEffect(() => {
    const scrollPos = getScrollPosition();

    if ((lastPage > 1 || scrollPos > 0) && typeof window !== 'undefined') {
      setTimeout(() => {
        window.scrollTo({ top: scrollPos, behavior: 'auto' });
        setLastPage(1);
        setLastClickedIndex(null);
        setScrollPosition(0);
      }, 50);
    }
  }, [lastPage, getScrollPosition, setLastPage, setLastClickedIndex, setScrollPosition]);

  /** Pagination handler */
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col w-full">
      <div className="space-y-4 p-4">
        <div className="flex sm:flex-row flex-col items-start sm:space-x-4 space-y-4 sm:space-y-0 w-full">
          {isLoading ? (
            <>
              <div className="flex-1">
                <Skeleton className="mb-2 w-full h-12" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="w-48 h-10" />
                <Skeleton className="w-48 h-10" />
              </div>
            </>
          ) : (
            <>
              <div className="flex-1">
                <SearchBar
                  basePath="/"
                  searchBy={searchBy}
                  departments={departmentOptions}
                  query={query}
                  setQuery={setQuery}
                  setSearchByValue={setSearchBy}
                  onSubmit={handleSearchSubmit}
                  currentDepartmentId={currentDepartmentId}
                  filters={filters}
                />
              </div>
            </>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-8 w-full">
            <div className="loading">Loading...</div>
          </div>
        )}

        {/* Error State */}
        {fetchError && (
          <div className="bg-red-100 p-4 rounded-md w-full text-red-800">
            <p>Error: {fetchError}</p>
          </div>
        )}

        {/* Empty Results */}
        {!isLoading && !fetchError && totalObjects === 0 && query && (
          <div className="py-8 w-full text-center">
            <p className="text-gray-600">No results found for &quot;{query}&quot;.</p>
          </div>
        )}

        {/* Results Count */}
        {!isLoading && totalObjects > 0 && (
          <div className="py-2">
            <p className="text-gray-800 text-md">
              Found {totalObjects} results {query ? `for &quot;${query}&quot;` : ''}
              {initialDepartmentIds.length > 0 && departmentOptions.length > 0
                ? ` in ${
                    departmentOptions.find(dept => dept.departmentId === Number(initialDepartmentIds[0]))
                      ?.displayName || 'Selected Department'
                  }`
                : ''}
            </p>
          </div>
        )}

        {/* Debug Info for Empty Results when we should have data */}
        {!isLoading && !fetchError && totalObjects > 0 && validObjectDetails.length === 0 && (
          <div className="bg-amber-50 p-2 py-2 border border-amber-300 rounded w-full text-amber-600 text-sm">
            <p>Found {totalObjects} objects but details aren&apos;t available. Try refreshing the page.</p>
            <p>
              Debug: validObjectDetails.length = {validObjectDetails.length}, totalObjects = {totalObjects}
            </p>
          </div>
        )}

        {/* Object Grid */}
        <Suspense fallback={<Skeleton className="rounded-lg w-full h-96" />}>
          {!isLoading && validObjectDetails.length > 0 ? (
            <ObjectGrid objects={validObjectDetails} searchParamsString={''} />
          ) : isLoading ? (
            <Skeleton className="rounded-lg w-full h-96" />
          ) : null}
        </Suspense>

        {/* Pagination */}
        <Suspense fallback={<Skeleton className="mx-auto my-4 rounded w-40 h-10" />}>
          {!isLoading && totalObjects > 0 ? (
            <div className="flex justify-center py-4 w-full">
              <PaginationControls
                currentPage={page}
                totalPages={Math.ceil(totalObjects / 25)}
                onPageChange={handlePageChange}
              />
            </div>
          ) : isLoading ? (
            <Skeleton className="mx-auto my-4 rounded w-40 h-10" />
          ) : null}
        </Suspense>
      </div>
    </div>
  );
}
