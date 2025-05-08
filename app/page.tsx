import { fetchDepartments } from '@/lib/api/met-api';
import { Suspense } from 'react';
import ClientApp from './client-app';

/**
 * Defines the expected shape of the search parameters once the promise is resolved
 */
interface ResolvedSearchParams {
  page?: string;
  departmentId?: string;
  q?: string;
  hasImages?: string; // 'true', 'false', or other/undefined
  searchBy?: string;
  isHighlight?: boolean;
  isOnView?: string;
  openAccess?: string;
}

interface ObjectsPageProps {
  /**
   * Search parameters for the page, provided as a Promise.
   * This structure is per the input; typically Next.js provides searchParams directly.
   */
  searchParams: Promise<ResolvedSearchParams>;
}

export default async function ObjectsPage({ searchParams: searchParamsPromise }: ObjectsPageProps) {
  /** Await the search parameters from the provided promise  */
  const resolvedSearchParams = await searchParamsPromise;

  /** Fetch departments on the server */
  const { departments } = await fetchDepartments();

  /** Current Page */
  const pageStr = resolvedSearchParams?.page;
  let currentPage = 1;

  if (pageStr) {
    const parsedPage = Number.parseInt(pageStr, 10);
    if (!Number.isNaN(parsedPage) && parsedPage > 0) {
      currentPage = parsedPage;
    }
  }

  /** Department ID */
  const departmentIdStr = resolvedSearchParams?.departmentId;
  let departmentIds: number[] = [];

  if (departmentIdStr) {
    departmentIds = departmentIdStr
      .split(',')
      .map(id => Number(id))
      .filter(id => !Number.isNaN(id));
  }

  /** Query string */
  const q = resolvedSearchParams?.q || undefined; // Default to undefined if empty or not present

  const hasImagesStr = resolvedSearchParams?.hasImages;
  let hasImages: boolean | undefined;

  if (hasImagesStr === 'true') {
    hasImages = true;
  } else if (hasImagesStr === 'false') {
    hasImages = false;
  }

  /** Parse isOnView */
  const isOnViewStr = resolvedSearchParams?.isOnView;
  let isOnView: boolean | undefined;
  if (isOnViewStr === 'true') {
    isOnView = true;
  } else if (isOnViewStr === 'false') {
    isOnView = false;
  }

  /** Parse openAccess */
  const openAccessStr = resolvedSearchParams?.openAccess;
  let openAccess: boolean | undefined;
  if (openAccessStr === 'true') {
    openAccess = true;
  } else if (openAccessStr === 'false') {
    openAccess = false;
  }

  /** Search By filter  */
  const searchBy = resolvedSearchParams?.searchBy || 'all'; // Default to 'all'

  /** Server side rendering - the simplest fallback */
  return (
    <div className="mx-auto px-4 max-w-7xl container">
      {/* Header is now only rendered in the client component */}

      {/* Use Suspense to defer rendering of the client component */}
      <Suspense fallback={<div className="min-h-screen" />}>
        <ClientApp
          currentPage={currentPage}
          departmentIds={departmentIds}
          q={q}
          hasImages={hasImages}
          searchBy={searchBy}
          isOnView={isOnView}
          openAccess={openAccess}
          departments={departments}
        />
      </Suspense>
    </div>
  );
}
