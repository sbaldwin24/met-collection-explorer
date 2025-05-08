import type { FC } from 'react';

export interface DetailItemProps {
  label: string;
  value: string | number | null | undefined;
}

export const DetailItem: FC<DetailItemProps> = ({ label, value }) => {
  if (value === null || value === undefined || value === '') return null;

  return (
    <p>
      <strong className="font-semibold text-primary/90">{label}:</strong> {String(value)}
    </p>
  );
};
