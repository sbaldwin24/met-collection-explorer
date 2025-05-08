'use client';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
  /** Prevent rendering if there's only one page */
  if (totalPages <= 1) return null;

  /** Calculate range of pages to show */
  const getPageNumbers = () => {
    const range = 2;
    const pages: (number | string)[] = [];

    /**  Always show first page */
    pages.push(1);

    /** Start range */
    const rangeStart = Math.max(2, currentPage - range);
    if (rangeStart > 2) {
      pages.push('...');
    }

    /**  Pages around current page */
    for (let i = rangeStart; i <= Math.min(totalPages - 1, currentPage + range); i++) {
      pages.push(i);
    }

    /**  End range */
    if (currentPage + range < totalPages - 1) {
      pages.push('...');
    }

    /**  Always show last page if there is more than one page */
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex justify-center" aria-label="Pagination">
      <ul className="flex space-x-1 list-none">
        {/* Previous page button */}
        <li>
          <button
            onClick={() => currentPage > 1 && handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded-md ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
            aria-label="Previous page"
            type="button"
          >
            &laquo;
          </button>
        </li>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => {
          if (typeof page === 'string') {
            return (
              <li key={`ellipsis-${String(index)}`}>
                <span className="bg-white px-3 py-2 border border-gray-300 rounded-md text-gray-700">{page}</span>
              </li>
            );
          }

          return (
            <li key={String(index)}>
              <button
                onClick={() => handlePageClick(page)}
                className={`px-3 py-2 border color-primary-dark rounded-md ${
                  currentPage === page
                    ? 'bg-violet-200 color-black color-primary-dark'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
                type="button"
              >
                {page}
              </button>
            </li>
          );
        })}

        {/* Next page button */}
        <li>
          <button
            onClick={() => currentPage < totalPages && handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded-md ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
            aria-label="Next page"
            type="button"
          >
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
}
