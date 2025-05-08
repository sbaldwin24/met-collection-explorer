'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GoBackButton() {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.back()}
      className="inline-flex items-center px-4 py-2 rounded-md font-semibold transition duration-150 ease-in-out color-background-primary hover:color-background-secondary color-white"
    >
      <ArrowLeft aria-hidden="true" className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" />
      Go back to gallery
    </Button>
  );
}
