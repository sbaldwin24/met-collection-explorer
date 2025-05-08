import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useCallback } from 'react';

interface UsePaginationNavigationOptions {
  page: number;
  setLastClickedIndex: (idx: number | null) => void;
  setLastPage: (page: number) => void;
  setScrollPosition: (pos: number) => void;
  basePath: string;
  router: AppRouterInstance;
}

export interface UsePaginationNavigationResult {
  handlePageChange: (newPage: number) => void;
}

export function usePaginationNavigation({
  setLastClickedIndex,
  setLastPage,
  setScrollPosition
}: UsePaginationNavigationOptions): UsePaginationNavigationResult {
  const handlePageChange = useCallback(
    (newPage: number) => {
      setLastClickedIndex(null);
      setLastPage(newPage);
      setScrollPosition(0);

      window.scrollTo({ top: 0, behavior: 'auto' });
    },
    [setLastClickedIndex, setLastPage, setScrollPosition]
  );

  return { handlePageChange };
}
