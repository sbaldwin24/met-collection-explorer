'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Department } from '@/lib/types';
import { useRouter, useSearchParams } from 'next/navigation';
import type { FC } from 'react';

interface FilterDropdownProps {
  departments: Department[];
  basePath: string;
  currentDepartmentId: string;
}

const FilterDropdown: FC<FilterDropdownProps> = ({ departments = [], basePath, currentDepartmentId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDepartmentChange = (departmentId: string) => {
    if (departmentId === (currentDepartmentId || 'all')) return;

    const currentParams = new URLSearchParams(Array.from(searchParams.entries()));

    if (departmentId && departmentId !== 'all') {
      currentParams.set('departmentId', departmentId);
    } else {
      currentParams.delete('departmentId');
    }
    currentParams.set('page', '1');

    router.push(`${basePath}?${String(currentParams)}`);
  };

  return (
    <Select onValueChange={handleDepartmentChange} value={currentDepartmentId || 'all'}>
      <SelectTrigger
        className="bg-card shadow-sm border-border rounded-md w-[180px] sm:w-[250px] text-card-foreground"
        aria-label="Filter by Department"
      >
        <SelectValue placeholder="Filter by Department" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Departments</SelectItem>
        {departments.map(dept => (
          <SelectItem key={dept.departmentId} value={String(dept.departmentId)}>
            {dept.displayName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FilterDropdown;
