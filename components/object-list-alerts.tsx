import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import React from 'react';

interface ObjectListAlertsProps {
  fetchError: string | null;
  notFound: boolean;
  searchQuery: string;
  searchQueryIsEmpty: boolean;
}

export const ObjectListAlerts = React.memo(function ObjectListAlerts({
  fetchError,
  notFound,
  searchQueryIsEmpty
}: ObjectListAlertsProps) {
  return (
    <>
      {fetchError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}
      {notFound && (
        <Alert variant="default" className="mb-6" role="alert">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>Object not found</AlertTitle>
          <AlertDescription>No artwork was found for the specified Object ID.</AlertDescription>
        </Alert>
      )}
      {searchQueryIsEmpty && (
        <div className="flex flex-col justify-center items-center py-16 text-muted-foreground">
          <p className="text-lg">Please enter a search to begin exploring the collection.</p>
        </div>
      )}
    </>
  );
});
