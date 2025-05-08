'use client';

import { useState } from 'react';

interface Department {
  id: number;
  displayName: string;
}

interface DepartmentFilterMenuProps {
  departments: Department[];
  selectedDepartmentId?: number;
  onChange: (departmentId: number | undefined) => void;
}

export default function DepartmentFilterMenu({
  departments,
  selectedDepartmentId,
  onChange
}: DepartmentFilterMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectDepartment = (id: number | undefined) => {
    onChange(id);
    setIsOpen(false);
  };

  const selectedDepartment = selectedDepartmentId
    ? departments.find(dept => dept.id === selectedDepartmentId)
    : undefined;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center bg-white hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{selectedDepartment ? selectedDepartment.displayName : 'All Departments'}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="z-10 absolute bg-white shadow-lg mt-1 border border-gray-300 rounded-md w-60 max-h-60 overflow-auto">
          <ul className="py-1 text-base" role="listbox">
            <li
              role="option"
              aria-selected={selectedDepartmentId === undefined}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                selectedDepartmentId === undefined ? 'bg-blue-100 text-blue-800' : ''
              }`}
              onClick={() => handleSelectDepartment(undefined)}
            >
              All Departments
            </li>

            {departments.map(department => (
              <li
                key={department.id}
                role="option"
                aria-selected={selectedDepartmentId === department.id}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  selectedDepartmentId === department.id ? 'bg-blue-100 text-blue-800' : ''
                }`}
                onClick={() => handleSelectDepartment(department.id)}
              >
                {department.displayName}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
