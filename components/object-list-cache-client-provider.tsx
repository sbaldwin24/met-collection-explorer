'use client';

import { ObjectListCacheProvider } from '@/context/object-list-cache-context';
import { type ReactNode, useEffect, useState } from 'react';

export default function ObjectListCacheClientProvider({ children }: { children: ReactNode }) {
  // Safe client-side only rendering
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Return empty div until client-side hydration is complete
  if (!isMounted) {
    return <div className="min-h-screen" />;
  }

  // Only render the actual provider on the client
  return <ObjectListCacheProvider>{children}</ObjectListCacheProvider>;
}
