import { useCallback, useRef } from 'react';

interface UseCardNavigationOptions {
  page: number;
  setLastClickedIndex: (idx: number | null) => void;
  setLastPage: (page: number) => void;
  setScrollPosition: (pos: number) => void;
}

export interface UseCardNavigationResult {
  handleCardClick: (idx: number) => void;
}

export function useCardNavigation({
  page,
  setLastClickedIndex,
  setLastPage,
  setScrollPosition
}: UseCardNavigationOptions): UseCardNavigationResult {
  /** Avoids triggering multiple navigation events from single card interaction  */
  const cardClickingRef = useRef(false);

  /**
   * Process card selection event:
   * - Cache the selected card's index for state persistence
   * - Save current scroll position for restoration
   * - Implement debounce mechanism to prevent navigation race conditions
   */
  const handleCardClick = useCallback(
    (idx: number) => {
      if (cardClickingRef.current) return;
      cardClickingRef.current = true;
      setLastClickedIndex(idx);
      setLastPage(page);
      setScrollPosition(window.scrollY);

      setTimeout(() => {
        cardClickingRef.current = false;
      }, 1000);
    },
    [page, setLastClickedIndex, setLastPage, setScrollPosition]
  );

  return { handleCardClick };
}
