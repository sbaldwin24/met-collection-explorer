import { useState } from 'react';

export interface UseSearchInputStateResult {
  searchInput: string;
  setSearchInput: (value: string) => void;
  searchByInput: string;
  setSearchByInput: (value: string) => void;
}

export function useSearchInputState(
  initialSearchQuery: string,
  initialSearchByValue: string
): UseSearchInputStateResult {
  const [searchInput, setSearchInput] = useState(initialSearchQuery);
  const [searchByInput, setSearchByInput] = useState(initialSearchByValue);

  return { searchInput, setSearchInput, searchByInput, setSearchByInput };
}
