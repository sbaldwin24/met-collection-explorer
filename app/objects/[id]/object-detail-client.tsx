'use client';

import { DetailItem } from '@/components/detail-item/detail-item';
import { LightboxGallery } from '@/components/lightbox-gallery/lightbox-gallery';
import ObjectImageClient from '@/components/object-image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { ObjectDetails } from '@/lib/schemas';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

/** Fallback image paths */
const placeholderImg = 'images/fallback.webp';
const placeholderThumb = 'images/fallback-80x80.webp';

interface ObjectDetailClientProps {
  /** Props interface leverages type inference from schemas.ts */
  objectDetailsPromise: Promise<ObjectDetails | null | { notFound: true }>;
}

export default function EntityDetailClient({ objectDetailsPromise }: ObjectDetailClientProps) {
  /** Validation on component mount */
  const isInitiallyPromise =
    typeof objectDetailsPromise === 'object' &&
    objectDetailsPromise !== null &&
    typeof (objectDetailsPromise as Promise<unknown>).then === 'function';

  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  console.log('from: ', from);
  const backToGalleryHref = from ? `/?${from}` : '/';

  /** State interface automatically derived from schema.ts */
  const [objectDetails, setObjectDetails] = useState<ObjectDetails | null | { notFound: true }>(null);
  const [loading, setLoading] = useState(true);
  /** Error state tracking for Promise failures */
  const [errorState, setErrorState] = useState<string | null>(null);
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!isInitiallyPromise) {
    return (
      <div className="mx-auto px-4 py-8 md:py-12 max-w-7xl container">
        <p className="text-destructive">Error: objectDetailsPromise prop was initially missing or invalid.</p>
        <Button asChild variant="outline" size="sm" className="group mt-6">
          <Link href={backToGalleryHref} prefetch={true}>
            <ArrowLeft aria-hidden="true" className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Gallery
          </Link>
        </Button>
      </div>
    );
  }

  useEffect(() => {
    let cancelled = false;

    /** Reset state for the new promise */
    setLoading(true);
    setObjectDetails(null);
    setErrorState(null); // Reset error state

    /** Force conversion to a standard Promise */
    /** Safe guard against edge cases: handles thenable objects w/out full Promise API */
    /** and provides fallback when expected Promise type validation fails */
    const promise = Promise.resolve(objectDetailsPromise);

    /** Promise is now guaranteed to be a standard Promise */
    promise
      .then(details => {
        if (
          typeof objectDetailsPromise !== 'object' ||
          objectDetailsPromise === null ||
          typeof objectDetailsPromise.then !== 'function'
        ) {
          console.warn('ObjectDetailClient useEffect: Original prop was no longer a promise when resolution occurred.');

          setErrorState('Object details could not be resolved. Please try again later.');
        }

        if (!cancelled) {
          setObjectDetails(details);
          setLoading(false);
        }
      })
      .catch(error => {
        console.error(`Error resolving objectDetailsPromise: ${error}`);

        if (!cancelled) {
          setErrorState(error instanceof Error ? error.message : 'An unknown error occurred while fetching details.');
          setObjectDetails(null);
          setLoading(false);
        }
      });

    return () => {
      /** Cleanup function to prevent memory leaks by canceling async operations when component unmounts */
      cancelled = true;
    };
  }, [objectDetailsPromise]);

  if (loading) {
    return (
      <div className="mx-auto px-4 py-8 md:py-12 max-w-7xl container">
        <Skeleton className="mb-6 w-48 h-8" />

        <div className="flex md:flex-row flex-col gap-8 lg:gap-12">
          <Skeleton className="rounded-lg w-full md:w-1/2 lg:w-2/5 h-80" />

          <div className="w-full md:w-1/2 lg:w-3/5">
            <Skeleton className="mb-4 w-3/4 h-10" />
            <Skeleton className="mb-2 w-1/2 h-6" />
            <Skeleton className="mb-6 w-full h-4" />
            <Separator className="my-6" />
            <Skeleton className="mb-3 w-full h-4" />
            <Skeleton className="mb-3 w-full h-4" />
            <Skeleton className="mb-3 w-3/4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  if (errorState) {
    return (
      <div className="mx-auto px-4 py-8 md:py-12 max-w-7xl text-center container">
        <h2 className="mb-4 text-destructive text-xl">Error Loading Details</h2>
        <p className="mb-6 text-muted-foreground">{errorState}</p>
        <Button asChild variant="outline" size="sm" className="group mt-6">
          <Link href={backToGalleryHref} prefetch={true}>
            <ArrowLeft aria-hidden="true" className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Gallery
          </Link>
        </Button>
      </div>
    );
  }

  /** Handle not found state AFTER loading and error checks */
  if (!objectDetails || (typeof objectDetails === 'object' && 'notFound' in objectDetails && objectDetails.notFound)) {
    return (
      <div className="mx-auto px-4 py-8 md:py-12 max-w-7xl text-center container">
        <h2 className="mb-4 text-destructive text-xl">Object Not Found</h2>
        <p className="mb-6 text-muted-foreground">
          We couldn't find the details for this object. It might have been moved or the ID may be incorrect.
        </p>
        <Button asChild variant="outline" size="sm" className="group mt-6">
          <Link href={backToGalleryHref} prefetch={true}>
            <ArrowLeft aria-hidden="true" className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Gallery
          </Link>
        </Button>
      </div>
    );
  }

  /** Safe type assertion using schema-derived types after handling all edge cases */
  const safeDetails = objectDetails as ObjectDetails;

  const title = safeDetails.title || 'Untitled Artwork';
  const artistName = safeDetails.artistDisplayName || 'Unknown Artist';
  const artistBio = safeDetails.artistDisplayBio || null;
  const objectDate = safeDetails.objectDate || 'Date unknown';
  const imageUrl = safeDetails.primaryImage || undefined;
  /** Guarantee additionalImages is an array before applying array method */
  const additionalImageUrls = Array.isArray(safeDetails.additionalImages)
    ? [
        ...new Set(
          safeDetails.additionalImages.filter(
            (img: string | null): img is string => typeof img === 'string' && img.startsWith('http') && img !== imageUrl
          )
        )
      ]
    : [];

  /** Lightbox images array: primary first, then additional */
  const lightboxImages = [
    ...(imageUrl ? [{ src: imageUrl, alt: `Primary image of ${title}` }] : []),
    ...additionalImageUrls.map((imgUrl: string) => ({ src: imgUrl, alt: `Additional image of ${title}` }))
  ];
  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  const handleCloseLightbox = () => setLightboxOpen(false);

  return (
    <div className="mx-auto px-4 py-8 md:py-12 max-w-7xl container">
      <Button asChild variant="outline" size="sm" className="group mb-6">
        <Link href={backToGalleryHref} prefetch={true}>
          <ArrowLeft aria-hidden="true" className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Gallery
        </Link>
      </Button>

      {/* Main Content Layout */}
      <div className="flex md:flex-row flex-col gap-8 lg:gap-12">
        {/* Image Section */}
        <div className="w-full md:w-1/2 lg:w-2/5">
          {/* Primary Image */}
          <Suspense fallback={<Skeleton className="rounded-lg w-full aspect-square" />}>
            <button
              type="button"
              aria-label="Open image gallery"
              className="relative bg-muted shadow-lg mb-4 border border-border rounded-lg focus:outline-none focus:ring w-full overflow-hidden cursor-pointer"
              onClick={() => handleOpenLightbox(0)}
            >
              <ObjectImageClient
                src={imageUrl}
                alt={`Primary image of ${title}`}
                fallbackSrc={placeholderImg}
                priority
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                className="w-full h-full object-contain"
                imgClassName="object-contain"
                aspectRatio={1}
              />
            </button>
          </Suspense>

          {/* Additional Images */}
          {additionalImageUrls.length > 0 && (
            <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
              {additionalImageUrls.map((imgUrl: string, i: number) => (
                <Suspense key={imgUrl} fallback={<Skeleton className="flex-shrink-0 rounded w-20 h-20" />}>
                  <button
                    type="button"
                    aria-label="Open image gallery"
                    className="relative flex-shrink-0 bg-muted border hover:border-accent border-border rounded focus:outline-none focus:ring w-20 h-20 overflow-hidden transition-colors cursor-pointer"
                    onClick={() => handleOpenLightbox((imageUrl ? 1 : 0) + i)}
                  >
                    <ObjectImageClient
                      src={imgUrl}
                      alt={`Additional image of ${title}`}
                      fallbackSrc={placeholderThumb}
                      fill
                      sizes="80px"
                      className="w-full h-full object-cover"
                      imgClassName="object-cover"
                      loading="lazy"
                      decoding="async"
                      aspectRatio={1}
                    />
                  </button>
                </Suspense>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 lg:w-3/5">
          {/* Title */}
          <h1 className="mb-2 font-bold text-primary text-2xl md:text-3xl lg:text-4xl">{title}</h1>
          {/* Artist Info */}
          <h2 className="mb-1 text-secondary-foreground text-lg md:text-xl">{artistName}</h2>
          {artistBio && <p className="mb-4 text-muted-foreground text-sm">{artistBio}</p>}
          {/* Object Date */}
          <p className="mb-4 text-muted-foreground text-sm">
            <strong>Date:</strong> {objectDate}
          </p>
          <Separator className="my-6" />

          {/* Metadata Details */}
          <div className="space-y-3 text-foreground text-base">
            {safeDetails.medium && <DetailItem label="Medium" value={safeDetails.medium} />}
            {safeDetails.dimensions && <DetailItem label="Dimensions" value={safeDetails.dimensions} />}
            {safeDetails.classification && <DetailItem label="Classification" value={safeDetails.classification} />}
            {safeDetails.department && <DetailItem label="Department" value={safeDetails.department} />}
            {safeDetails.culture && <DetailItem label="Culture" value={safeDetails.culture} />}
            {safeDetails.period && <DetailItem label="Period" value={safeDetails.period} />}
            {safeDetails.creditLine && <DetailItem label="Credit Line" value={safeDetails.creditLine} />}
            {safeDetails.accessionNumber && <DetailItem label="Accession Number" value={safeDetails.accessionNumber} />}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-6">
            {safeDetails.isPublicDomain && <Badge variant="secondary">Public Domain</Badge>}
            {safeDetails.isHighlight && (
              <Badge variant="default" className="hover:bg-accent/50 text-accent-foreground color-primary-dark">
                Highlight
              </Badge>
            )}
            {/* Check if GalleryNumber exists and is not an empty string or "0" before rendering */}
            {safeDetails.GalleryNumber && safeDetails.GalleryNumber !== '0' && (
              <Badge variant="outline">On View: Gallery {safeDetails.GalleryNumber}</Badge>
            )}
          </div>

          {/* External Link */}
          {safeDetails.objectURL && (
            <Button
              asChild
              variant="link"
              className="inline-flex items-center gap-1 mt-6 px-0 color-primary-dark hover:color-primary/80"
            >
              <a href={safeDetails.objectURL} target="_blank" rel="noopener noreferrer">
                <strong>View on Met Museum Website</strong>
                <ExternalLink aria-hidden="true" className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Lightbox Gallery Modal */}
      <LightboxGallery
        images={lightboxImages}
        open={lightboxOpen}
        initialIndex={lightboxIndex}
        onClose={handleCloseLightbox}
      />
    </div>
  );
}
