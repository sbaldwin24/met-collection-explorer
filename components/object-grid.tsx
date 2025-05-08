import type { ObjectDetails } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';
import { LazyRender } from './lazy-render';

interface ObjectCardProps {
  object: ObjectDetails;
}

const ObjectCard = memo(function ObjectCard({ object }: ObjectCardProps) {
  const hasImage = object.primaryImageSmall && object.primaryImageSmall !== '';

  return (
    <div className="flex flex-col bg-white shadow-md hover:shadow-lg rounded-lg w-full h-full aspect-[3/4] overflow-hidden transition-shadow duration-300">
      <div className="relative bg-gray-100 h-48">
        {hasImage ? (
          <Image
            src={object.primaryImageSmall || ''}
            alt={object.title || 'Artwork image'}
            className="w-full h-full object-contain"
            width={300}
            height={200}
          />
        ) : (
          <div className="flex justify-center items-center bg-gray-200 w-full h-full">
            <span className="text-gray-500">No image available</span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-grow p-4">
        <h3 className="mb-2 font-semibold text-lg line-clamp-2">{object.title || 'Untitled'}</h3>
        {object.artistDisplayName && <p className="mb-1 text-gray-600 text-sm">{object.artistDisplayName}</p>}
        {object.objectDate && <p className="text-gray-500 text-sm">{object.objectDate}</p>}
        <div className="mt-auto pt-2">
          <div className="flex flex-wrap gap-1">
            {object.department && (
              <span className="inline-block bg-gray-100 px-2 py-1 rounded-full text-gray-800 text-xs">
                {object.department}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

interface ObjectGridProps {
  objects: ObjectDetails[];
  searchParamsString?: string;
}

export default function ObjectGrid({ objects, searchParamsString }: ObjectGridProps) {
  const searchParams = searchParamsString || (typeof window !== 'undefined' ? window.location.search : '');
  if (!objects || objects.length === 0) {
    return (
      <div className="py-8 w-full text-center">
        <p className="text-gray-600">No objects to display.</p>
      </div>
    );
  }

  return (
    <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-fr">
      {objects.map(obj => (
        <div key={obj.objectID} className="flex w-full h-full">
          <Link
            href={`/objects/${obj.objectID}${searchParams ? `?from=${encodeURIComponent(searchParams.startsWith('?') ? searchParams.slice(1) : searchParams)}` : ''}`}
            className="flex flex-1 text-inherit no-underline"
            style={{ height: '100%' }}
          >
            <LazyRender>
              <ObjectCard object={obj} />
            </LazyRender>
          </Link>
        </div>
      ))}
    </div>
  );
}
