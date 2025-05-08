import SearchBar from '@/components/search-bar';
import type { Department } from '@/lib/types';
import React from 'react';

interface SearchAndFilterControlsProps {
  departments: Department[];
  searchInput: string;
  setSearchInput: (value: string) => void;
  searchByInput: string;
  setSearchByInput: (value: string) => void;
  onSubmit: (q: string, by: string) => void;
  basePath: string;
}

export const SearchAndFilterControls = React.memo(function SearchAndFilterControls({
  departments,
  searchInput,
  setSearchInput,
  searchByInput,
  setSearchByInput,
  onSubmit,
  basePath
}: SearchAndFilterControlsProps) {
  return (
    <nav className="mb-8" aria-label="Collection search and filters">
      <div className="flex md:flex-row flex-col md:items-center gap-4 w-full">
        <SearchBar
          basePath={basePath}
          searchBy={searchByInput}
          departments={departments}
          query={searchInput}
          setQuery={setSearchInput}
          setSearchByValue={setSearchByInput}
          onSubmit={onSubmit}
        />
      </div>
    </nav>
  );
});
