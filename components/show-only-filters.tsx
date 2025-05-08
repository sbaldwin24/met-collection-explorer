import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { Filter } from '@/lib/types';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { FC } from 'react';

const FILTERS = [
  { key: 'highlights', label: 'Highlights' },
  { key: 'hasImages', label: 'Artworks with Images' },
  { key: 'onDisplay', label: 'Artwork on Display' },
  { key: 'openAccess', label: 'Open Access' }
] as const satisfies readonly Filter[];

interface ShowOnlyFiltersProps {
  basePath: string;
  filters: {
    highlights: boolean;
    hasImages: boolean;
    onDisplay: boolean;
    openAccess: boolean;
  };
}

const paramKeyMap: Record<string, string> = {
  highlights: 'isHighlight',
  onDisplay: 'isOnView',
  hasImages: 'hasImages',
  openAccess: 'openAccess'
};

const ShowOnlyFilters: FC<ShowOnlyFiltersProps> = ({ basePath, filters }) => {
  const router = useRouter();

  const activeFilters = FILTERS.filter(({ key }) => filters[key as keyof typeof filters]).map(f => f.key);

  const handleCheckedChange = (key: string) => (checked: boolean | 'indeterminate') => {
    const paramKey = paramKeyMap[key] || key;
    const params = new URLSearchParams(window.location.search);
    if (checked === true) {
      params.set(paramKey, 'true');
    } else {
      params.delete(paramKey);
    }
    params.set('page', '1');
    router.push(`${basePath}?${params.toString()}`);
  };

  const handleChipRemove = (key: string) => {
    const paramKey = paramKeyMap[key] || key;
    const params = new URLSearchParams(window.location.search);
    params.delete(paramKey);
    params.set('page', '1');
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex flex-col gap-2">
        <h2 className="mb-1 font-semibold text-base color-black">Show Only:</h2>
        <div className="flex flex-wrap items-center gap-4">
          {FILTERS.map(({ key, label }) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={`filter-${key}`}
                checked={filters[key as keyof typeof filters]}
                onCheckedChange={handleCheckedChange(key)}
                aria-labelledby={`label-${key}`}
              />
              <Label
                htmlFor={`filter-${key}`}
                id={`label-${key}`}
                className="peer-disabled:opacity-70 font-medium text-muted-foreground hover:text-foreground text-sm leading-none cursor-pointer peer-disabled:cursor-not-allowed"
              >
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-0 w-full">
          {FILTERS.filter(f => activeFilters.includes(f.key)).map(({ key, label }) => (
            <span
              key={key}
              className="inline-flex items-center px-3 py-1 border border-muted-foreground/20 rounded-full text-muted-foreground text-sm"
              style={{ backgroundColor: '#DCDAF5' }}
            >
              {label}
              <button
                type="button"
                aria-label={`Remove ${label} filter`}
                onClick={() => handleChipRemove(key)}
                className="hover:bg-muted-foreground/10 ml-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <X className="w-4 h-4" fill="currentColor" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowOnlyFilters;
