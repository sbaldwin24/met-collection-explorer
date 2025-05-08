import PaginationControls from '@/components/pagination-controls';
import { Skeleton } from '@/components/ui/skeleton';
import React, { Suspense } from 'react';

interface PaginationSectionProps {
  currentPage: number;
  totalObjects: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

export const PaginationSection = React.memo(function PaginationSection({
  currentPage,
  totalObjects,
  pageSize,
  onPageChange
}: PaginationSectionProps) {
  const totalPages = Math.ceil(totalObjects / pageSize);
  return (
    <Suspense
      fallback={
        <div className="flex justify-center space-x-4 mt-8">
          <Skeleton className="w-24 h-10" />
          <Skeleton className="w-24 h-10" />
        </div>
      }
    >
      <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </Suspense>
  );
});
