'use client';

import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import type { ObjectDetails } from '@/lib/types';
import type { FC } from 'react';
import React from 'react';
import ObjectImageClient from './object-image';

interface ObjectCardProps {
  object: Partial<ObjectDetails> & Pick<ObjectDetails, 'objectID'>;
}

/** Placeholder image if primaryImageSmall is an empty string or fails to load */
const placeholderSmall = '/images/fallback-80x80.webp';

const ObjectCard: FC<ObjectCardProps> = React.memo(({ object }) => {
  if (!object || !object.objectID) {
    return (
      <Card className="flex flex-col justify-center items-center bg-destructive/10 shadow-lg p-4 rounded-lg h-full overflow-hidden">
        <CardTitle className="text-destructive text-sm text-center">Invalid Data</CardTitle>
      </Card>
    );
  }

  const imageUrl = object.primaryImageSmall || undefined; // Pass undefined if missing
  const title = object.title || 'Untitled';
  const artist = object.artistDisplayName || 'Unknown Artist';

  return (
    <Card className="group flex flex-col bg-card shadow-sm rounded-md w-full h-full overflow-hidden transition-shadow duration-300 hover:cursor-pointer">
      <CardContent className="p-0">
        <ObjectImageClient
          src={imageUrl}
          alt={`Image of ${title}`}
          fallbackSrc={placeholderSmall}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 23vw"
          className="bg-muted w-full overflow-hidden"
          imgClassName="object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          aspectRatio={1}
        />
      </CardContent>
      <CardFooter className="flex flex-col flex-grow items-start p-3 pt-0 pb-6 md:pb-4">
        <CardTitle className="mb-2">
          <h2 className="mb-2 font-semibold group-hover:text-accent text-base md:text-xl line-clamp-2 leading-tight transition-colors">
            {title}
          </h2>
        </CardTitle>
        <CardDescription>
          <h3 className="text-muted-foreground text-sm md:text-base line-clamp-1">{artist}</h3>
        </CardDescription>
      </CardFooter>
    </Card>
  );
});

// Add displayName to satisfy the ESLint rule
ObjectCard.displayName = 'ObjectCard';

export default ObjectCard;
