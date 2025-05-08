'use client';

import { useState } from 'react';

interface FlagFilterMenuProps {
  hasImages: boolean;
  isOnView: boolean;
  isPublicDomain: boolean;
  isHighlight: boolean;
  onChange: (flagName: 'hasImages' | 'isOnView' | 'isPublicDomain' | 'isHighlight', value: boolean) => void;
}

export default function FlagFilterMenu({
  hasImages,
  isOnView,
  isPublicDomain,
  isHighlight,
  onChange
}: FlagFilterMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFlag = (flagName: 'hasImages' | 'isOnView' | 'isPublicDomain' | 'isHighlight') => {
    switch (flagName) {
      case 'hasImages':
        onChange(flagName, !hasImages);
        break;
      case 'isOnView':
        onChange(flagName, !isOnView);
        break;
      case 'isPublicDomain':
        onChange(flagName, !isPublicDomain);
        break;
      case 'isHighlight':
        onChange(flagName, !isHighlight);
        break;
    }
  };

  // Count active filters
  const activeFilterCount = [hasImages, isOnView, isPublicDomain, isHighlight].filter(Boolean).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center bg-white hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="z-10 absolute bg-white shadow-lg mt-1 p-3 border border-gray-300 rounded-md w-64">
          <div className="flex flex-col space-y-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hasImages}
                onChange={() => toggleFlag('hasImages')}
                className="w-5 h-5 text-blue-600 form-checkbox"
              />
              <span className="ml-2 text-gray-700">Has Images</span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isOnView}
                onChange={() => toggleFlag('isOnView')}
                className="w-5 h-5 text-blue-600 form-checkbox"
              />
              <span className="ml-2 text-gray-700">On Display</span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublicDomain}
                onChange={() => toggleFlag('isPublicDomain')}
                className="w-5 h-5 text-blue-600 form-checkbox"
              />
              <span className="ml-2 text-gray-700">Open Access</span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isHighlight}
                onChange={() => toggleFlag('isHighlight')}
                className="w-5 h-5 text-blue-600 form-checkbox"
              />
              <span className="ml-2 text-gray-700">Highlights Only</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
