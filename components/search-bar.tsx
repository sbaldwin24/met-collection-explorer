'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Department } from '@/lib/types';
import { Search, X } from 'lucide-react';
import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import FilterDropdown from './department-filter-menu';
import ShowOnlyFilters from './show-only-filters';

interface SearchBarProps {
  basePath: string;
  searchBy: string;
  departments: Department[];
  query: string;
  setQuery: (q: string) => void;
  setSearchByValue: (v: string) => void;
  onSubmit: (q: string, by: string) => void;
  currentDepartmentId: string;
  filters: {
    highlights: boolean;
    hasImages: boolean;
    onDisplay: boolean;
    openAccess: boolean;
  };
}

const SEARCH_BY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'objectId', label: 'Object ID' },
  { value: 'title', label: 'Title' }
];

const SearchBar: FC<SearchBarProps> = ({
  searchBy,
  departments,
  query,
  setQuery,
  setSearchByValue,
  onSubmit,
  basePath,
  currentDepartmentId,
  filters
}) => {
  /** Local state for the input field */
  const [inputValue, setInputValue] = useState(query);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery(inputValue);
    onSubmit(inputValue, searchBy);
  };

  const handleSearchByChange = (value: string) => {
    setSearchByValue(value);
  };

  const handleClear = () => {
    setInputValue('');
    setQuery('');
    onSubmit('', searchBy);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setQuery(inputValue);
      onSubmit(inputValue, searchBy);
    }
  };

  return (
    <header className="top-0 z-50 sticky bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur border-grid border-b w-full">
      <h1 className="mt-2 mb-6 font-bold text-2xl">Explore the Met Collection</h1>

      <nav className="mb-6" aria-label="Collection search and filters">
        <form onSubmit={handleSearch}>
          <div className="w-full">
            <div className="flex md:flex-row flex-col items-stretch gap-y-2 md:gap-x-2 md:gap-y-0 w-full">
              {/* Select - Search by */}
              <Select value={searchBy} onValueChange={handleSearchByChange}>
                <SelectTrigger
                  className="bg-card shadow-sm border-border rounded-md w-full md:w-[230px] text-card-foreground"
                  aria-label={`Search by ${searchBy}`}
                >
                  <SelectValue placeholder="Search By" />
                </SelectTrigger>
                <SelectContent>
                  {SEARCH_BY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative w-full md:w-xl">
                <Input
                  type="input"
                  placeholder="Search the collection"
                  value={inputValue}
                  onChange={event => setInputValue(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  className="bg-card shadow-sm pr-10 border-border rounded-md w-full text-card-foreground"
                  aria-label="Search thetwork"
                />
                {inputValue && (
                  <button
                    type="button"
                    onClick={handleClear}
                    aria-label="Clear search"
                    className="top-1/2 right-2 absolute hover:bg-muted p-1 rounded focus:outline-none focus:ring-2 focus:ring-ring -translate-y-1/2"
                    tabIndex={0}
                  >
                    <X className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  </button>
                )}
              </div>
              <Button
                type="submit"
                className="mr-4 rounded-md w-full md:w-20"
                size="icon"
                aria-label="Search"
                variant="default"
              >
                <Search aria-hidden="true" className="w-4 h-4" />
              </Button>
              <div className="w-full md:w-auto">
                <FilterDropdown departments={departments} basePath="/" currentDepartmentId={currentDepartmentId} />
              </div>
            </div>
            <div className="w-full">
              <div className="flex justify-start mt-4 w-full md:w-auto">
                <ShowOnlyFilters basePath={basePath} filters={filters} />
              </div>
            </div>
          </div>
        </form>
      </nav>
    </header>
  );
};

export default SearchBar;
