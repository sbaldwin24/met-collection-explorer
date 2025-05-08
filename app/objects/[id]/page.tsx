import { fetchObjectDetails } from '@/lib/api/met-api';
import { Suspense } from 'react';
import EntityDetailClient from './object-detail-client';

export default async function ObjectDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const objectId = Number.parseInt(params.id, 10);

  const objectDetailsPromise = fetchObjectDetails(objectId);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EntityDetailClient objectDetailsPromise={objectDetailsPromise} />
    </Suspense>
  );
}
