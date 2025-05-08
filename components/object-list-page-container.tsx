'use client';

import { useEffect, useState } from 'react';
import ObjectListCacheClientProvider from './object-list-cache-client-provider';
import ObjectListPageClient from './object-list-page-client';

interface ObjectListPageContainerProps {
  initialPage: number;
  initialDepartmentIds?: number[];
  initialQuery?: string;
  initialHasImages?: boolean;
  initialSearchBy?: string;
  initialIsOnView?: boolean;
  initialOpenAccess?: boolean;
  basePath: string;
  filters: {
    highlights: boolean;
    hasImages: boolean;
    onDisplay: boolean;
    openAccess: boolean;
  };
  currentDepartmentId: string;
}

export default function ObjectListPageContainer({ ...props }: ObjectListPageContainerProps) {
  /** Client-side only rendering to avoid SSR issues */
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen" />;
  }

  return (
    <ObjectListCacheClientProvider>
      <ObjectListPageClient {...props} />
    </ObjectListCacheClientProvider>
  );
}
