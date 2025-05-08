'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

/** Dynamically import components with SSR disabled */
const DynamicCacheProvider = dynamic(() => import('@/components/object-list-cache-client-provider'), { ssr: false });

/** Dynamic import for the client page */
const DynamicObjectListPageClient = dynamic(() => import('@/components/object-list-page-client-wrapper'), {
  ssr: false
});

interface ObjectListClientComponentProps {
  initialDepartmentIds?: number[];
  q?: string;
  hasImages?: boolean;
  searchBy: string;
  isOnView?: boolean;
  openAccess?: boolean;
  filters: {
    highlights: boolean;
    hasImages: boolean;
    onDisplay: boolean;
    openAccess: boolean;
  };
  currentDepartmentId: string;
}

export default function ObjectListClientComponent(props: ObjectListClientComponentProps) {
  /** Use client-side only rendering */
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    /** Return a minimal placeholder when not on client */
    return <div className="min-h-screen" />;
  }

  return (
    <DynamicCacheProvider>
      <DynamicObjectListPageClient
        initialQuery={props.q}
        initialDepartmentIds={props.initialDepartmentIds}
        initialHasImages={props.hasImages}
        initialSearchBy={props.searchBy}
        initialIsOnView={props.isOnView}
        initialOpenAccess={props.openAccess}
        filters={props.filters}
        currentDepartmentId={props.currentDepartmentId}
      />
    </DynamicCacheProvider>
  );
}
