'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';

interface LightboxGalleryProps {
  images: { src: string; alt: string }[];
  open: boolean;
  initialIndex: number;
  onClose: () => void;
}

export function LightboxGallery({ images, open, initialIndex, onClose }: LightboxGalleryProps) {
  const [current, setCurrent] = useState<number>(initialIndex);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);

  /** Focus trap and close on Escape */
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft') {
        setCurrent((prev: number) => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (event.key === 'ArrowRight') {
        setCurrent((prev: number) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };

    const listener = (event: Event) => handleKeyDown(event as unknown as KeyboardEvent);

    window.addEventListener('keydown', listener);

    return () => window.removeEventListener('keydown', listener);
  }, [open, images.length, onClose]);

  /** Reset index if images or initialIndex changes */
  useEffect(() => {
    if (open) setCurrent(initialIndex);
  }, [open, initialIndex]);

  /** Focus trap */
  useEffect(() => {
    if (!open) return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex="-1"]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();
  }, [open]);

  /** Reset zoom/pan on image change or modal close */
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [open]);

  if (!open) return null;

  const handlePrev = () => setCurrent((prev: number) => (prev === 0 ? images.length - 1 : prev - 1));
  const handleNext = () => setCurrent((prev: number) => (prev === images.length - 1 ? 0 : prev + 1));

  /** A11Y: allow Enter/Space to trigger onClick for overlay and close button */
  const handleOverlayKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'Escape') onClose();
  };

  const handleOverlayKeyUp = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClose();
    }
  };

  const handleButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  const handleButtonKeyUp = (event: KeyboardEvent<HTMLButtonElement>, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  /** Zoom handlers */
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.5, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.5, 1));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (zoom === 1) return;

    setDragging(true);
    setDragStart({ x: event.clientX - pan.x, y: event.clientY - pan.y });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging || zoom === 1 || !dragStart) return;

    setPan({ x: event.clientX - dragStart.x, y: event.clientY - dragStart.y });
  };
  const handleMouseUp = () => setDragging(false);
  const handleMouseLeave = () => setDragging(false);

  /** Touch events for mobile */
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (zoom === 1) return;

    const touch = event.touches[0];
    setDragging(true);
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
  };
  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!dragging || zoom === 1 || !dragStart) return;

    const touch = event.touches[0];
    setPan({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
  };

  const handleTouchEnd = () => setDragging(false);

  return (
    <dialog
      ref={dialogRef}
      open={open}
      aria-label="Image gallery"
      className="z-50 flex justify-center items-center bg-black/80 backdrop-blur-sm w-full max-w-none h-full"
      tabIndex={-1}
      onClick={onClose}
      onKeyDown={handleOverlayKeyDown}
      onKeyUp={handleOverlayKeyUp}
    >
      <div
        className="relative flex flex-col items-center bg-transparent mx-4 w-full max-w-3xl"
        onClick={event => event.stopPropagation()}
        onKeyUp={event => event.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          onKeyDown={event => handleButtonKeyDown(event, onClose)}
          onKeyUp={event => handleButtonKeyUp(event, onClose)}
          aria-label="Close gallery"
          className="top-2 right-2 absolute bg-black/60 hover:bg-black/80 p-2 rounded-full focus:outline-none focus:ring text-white"
        >
          <X className="w-6 h-6" />
        </button>
        {/* Zoom controls */}
        <div className="top-2 -left-12 z-10 absolute flex gap-2">
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="Zoom out"
            className="bg-black/60 hover:bg-black/80 disabled:opacity-50 p-2 rounded-full focus:outline-none focus:ring w-10 text-white"
            disabled={zoom <= 1}
          >
            -
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            aria-label="Reset zoom"
            className="bg-black/60 hover:bg-black/80 disabled:opacity-50 p-2 rounded-full focus:outline-none focus:ring w-10 text-white"
            disabled={zoom === 1}
          >
            1x
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="Zoom in"
            className="bg-black/60 hover:bg-black/80 disabled:opacity-50 p-2 rounded-full focus:outline-none focus:ring w-10 text-white"
            disabled={zoom >= 3}
          >
            +
          </button>
        </div>
        {/* Image navigation */}
        <div className="flex items-center w-full">
          <button
            type="button"
            onClick={handlePrev}
            onKeyDown={event => handleButtonKeyDown(event, handlePrev)}
            onKeyUp={event => handleButtonKeyUp(event, handlePrev)}
            aria-label="Previous image"
            className="bg-black/40 hover:bg-black/70 mr-2 p-2 rounded-full focus:outline-none focus:ring text-white"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <div
            ref={imgContainerRef}
            className="flex flex-1 justify-center items-center overflow-hidden cursor-grab"
            style={{ touchAction: zoom > 1 ? 'none' : 'auto' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={images[current].src}
              alt={images[current].alt}
              className="bg-white shadow-lg rounded max-w-full max-h-[80vh] object-contain select-none"
              loading="eager"
              draggable={false}
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'auto',
                transition: dragging ? 'none' : 'transform 0.2s'
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleNext}
            onKeyDown={event => handleButtonKeyDown(event, handleNext)}
            onKeyUp={event => handleButtonKeyUp(event, handleNext)}
            aria-label="Next image"
            className="bg-black/40 hover:bg-black/70 ml-2 p-2 rounded-full focus:outline-none focus:ring text-white"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
        {/* Image counter */}
        <div className="mt-4 text-white text-sm">
          {current + 1} / {images.length}
        </div>
      </div>
    </dialog>
  );
}
