'use client';

import type { Department } from '@/lib/types';
import dynamic from 'next/dynamic';

/** Dynamically import the client component with SSR disabled */
const ObjectListPageClient = dynamic(() => import('@/components/object-list-page-container'), { ssr: false });

interface ClientAppProps {
  currentPage: number;
  departmentIds: number[];
  q?: string;
  hasImages?: boolean;
  searchBy: string;
  isOnView?: boolean;
  openAccess?: boolean;
  departments: Department[];
}

export default function ClientApp(props: ClientAppProps) {
  /** Make sure to explicitly pass all initial props */
  return (
    <ObjectListPageClient
      initialPage={props.currentPage}
      initialDepartmentIds={props.departmentIds}
      initialQuery={props.q}
      initialHasImages={props.hasImages}
      initialSearchBy={props.searchBy}
      initialIsOnView={props.isOnView}
      initialOpenAccess={props.openAccess}
      basePath="/"
      departments={props.departments}
    />
  );
}
