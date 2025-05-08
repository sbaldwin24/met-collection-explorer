import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="mx-auto px-4 py-8 max-w-7xl container" aria-busy="true">
      {/* Search Bar & Filters Skeleton */}
      <div className="flex md:flex-row flex-col items-stretch gap-y-2 md:gap-x-2 md:gap-y-0 mb-6 w-full">
        {/* Search By Select */}
        <Skeleton className="rounded-md w-full md:w-[230px] h-10" />
        {/* Search Input */}
        <Skeleton className="rounded-md w-full md:w-xl h-10" />
        {/* Search Button */}
        <Skeleton className="rounded-md w-full md:w-20 h-10" />
        {/* Filter Dropdown */}
        <Skeleton className="rounded-md w-full md:w-[250px] h-10" />
        {/* Has Images Checkbox */}
        <div className="flex items-center space-x-2 md:ml-4">
          <Skeleton className="rounded w-5 h-5" />
          <Skeleton className="rounded w-32 h-5" />
        </div>
      </div>

      {/* Object Card Grid Skeleton */}
      <div className="gap-6 gap-y-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8">
        {Array.from({ length: 12 }).map((_, index) => (
          <Card
            key={`loading-skeleton-${String(index)}`}
            className="group flex flex-col bg-card shadow-sm rounded-sm w-full h-full overflow-hidden transition-shadow duration-300"
          >
            <CardContent className="p-0">
              <Skeleton className="bg-muted w-full aspect-square" />
            </CardContent>
            <CardFooter className="flex flex-col flex-grow items-start p-3 md:p-4">
              <Skeleton className="mb-2 rounded w-3/4 h-6" /> {/* Title */}
              <Skeleton className="rounded w-1/2 h-4" /> {/* Artist */}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center items-center space-x-4 mt-8">
        <Skeleton className="rounded-md w-10 h-10" /> {/* Prev button */}
        <Skeleton className="rounded w-32 h-6" /> {/* Page indicator */}
        <Skeleton className="rounded-md w-10 h-10" /> {/* Next button */}
      </div>
    </div>
  );
}
