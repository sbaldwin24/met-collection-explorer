'use client';

import type { ObjectListPageClientProps } from './object-list-page-client';
import ObjectListPageClient from './object-list-page-client';

export default function ObjectListPageClientWrapper(props: ObjectListPageClientProps) {
  return <ObjectListPageClient {...props} />;
}
