'use client';

import { cn } from '@/lib/utils';
import type { ImageProps } from 'next/image';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { AspectRatio } from './ui/aspect-ratio';

interface ObjectImageClientProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string | undefined | null;
  alt: string;
  fallbackSrc: string;
  imgClassName?: string;
  aspectRatio?: number;
}

/**
 * Renders an image with a fallback source if the primary source fails to load and/or the image is public
 * Uses client-side state to manage the source swap
 */
const ObjectImageClient: React.FC<ObjectImageClientProps> = ({
  src,
  alt,
  fallbackSrc,
  className,
  imgClassName,
  priority,
  fill,
  sizes,
  width,
  height,
  aspectRatio = 1,
  ...rest
}) => {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(!src);
  const [hasFallbackError, setHasFallbackError] = useState(false);

  /** Update currentSrc if the src or fallbackSrc prop changes */
  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
    setHasError(!src);
  }, [src, fallbackSrc]);

  /** Ensure the image source has a leading forward slash or is an absolute URL */
  const formattedSrc =
    typeof currentSrc === 'string' && !currentSrc.startsWith('/') && !currentSrc.startsWith('http')
      ? `/${currentSrc}`
      : currentSrc;

  /** Log only when the fallback image itself fails to load */
  useEffect(() => {
    if (hasFallbackError) {
      console.error(`No image for artwork and fallback image also failed: ${fallbackSrc}`);
    }
  }, [hasFallbackError, fallbackSrc]);

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(true);
    } else {
      /** Only log when both main and fallback fail */
      setHasFallbackError(true);
    }
  };

  /** Determine the layout mode based on props */
  const layoutProps = fill ? { fill: true, sizes: sizes || '100vw' } : { width: width || 300, height: height || 300 };

  return hasError ? (
    <AspectRatio
      ratio={aspectRatio}
      className={cn('flex items-center justify-center bg-muted text-muted-foreground w-full h-full', className)}
    >
      <span className="text-xs" aria-label="No image available">
        No Image
      </span>
    </AspectRatio>
  ) : (
    <AspectRatio ratio={aspectRatio} className={cn('relative w-full h-full', className)}>
      <Image
        key={currentSrc}
        src={formattedSrc}
        alt={alt}
        priority={priority}
        onError={handleError}
        className={imgClassName}
        {...layoutProps}
        {...rest}
      />
    </AspectRatio>
  );
};

export default ObjectImageClient;
