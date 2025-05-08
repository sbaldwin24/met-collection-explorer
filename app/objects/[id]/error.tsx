'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

export default function ObjectError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(`Error: ${error}`);
  }, [error]);

  return (
    <div className="flex flex-col justify-center items-center mx-auto px-4 py-16 text-center container">
      <AlertTriangle className="mb-4 w-16 h-16 text-destructive" />
      <h2 className="mb-2 font-semibold text-destructive text-2xl">Whoops! Something went wrong.</h2>
      <p className="mb-6 max-w-md text-muted-foreground">
        We encountered an error while trying to load the art objects. Please try again later.
        {error?.message && <span className="block mt-2 text-sm">Details: {error.message}</span>}
      </p>
      <Button onClick={() => reset()} variant="destructive">
        Try again
      </Button>
    </div>
  );
}
