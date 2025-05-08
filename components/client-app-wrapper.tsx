'use client';

import ObjectListPageClient from '@/components/object-list-page-client';
import { ObjectListCacheProvider } from '@/context/object-list-cache-context';
import type { Department } from '@/lib/types';

interface ClientAppWrapperProps {
  currentPage: number;
  departmentIds: number[];
  q?: string;
  hasImages?: boolean;
  searchBy: string;
  isOnView?: boolean;
  openAccess?: boolean;
  departments: Department[];
}

export default function ClientAppWrapper(props: ClientAppWrapperProps) {
  return (
    <ObjectListCacheProvider>
      <div className="mx-auto px-4 py-8 container">
        <header className="mb-6">
          <h1 className="font-bold text-primary-dark text-2xl md:text-3xl md:text-left">
            Metropolitan Museum Collection
          </h1>
        </header>

        <ObjectListPageClient
          initialQuery={props.q}
          initialDepartmentIds={props.departmentIds}
          initialSearchBy={props.searchBy}
        />
      </div>
    </ObjectListCacheProvider>
  );
}
