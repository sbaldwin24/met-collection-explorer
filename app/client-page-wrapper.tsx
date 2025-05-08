'use client';

import type { Department } from '@/lib/types';
import dynamic from 'next/dynamic';

const NoSSRApp = dynamic(() => import('@/components/client-app-wrapper'), { ssr: false });

interface ClientPageWrapperProps {
  currentPage: number;
  departmentIds: number[];
  q?: string;
  hasImages?: boolean;
  searchBy: string;
  isOnView?: boolean;
  openAccess?: boolean;
  departments: Department[];
}

export default function ClientPageWrapper(props: ClientPageWrapperProps) {
  return <NoSSRApp {...props} />;
}
