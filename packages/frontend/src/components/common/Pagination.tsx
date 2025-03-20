import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  itemsPerPage,
  totalItems,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  if (totalItems === 0) {
    return null;
  }

  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 bg-white p-4 rounded-lg shadow-sm">
      <div className="text-sm text-gray-700 mb-4 sm:mb-0">
        Showing{" "}
        <span className="font-medium">{totalItems === 0 ? 0 : startItem}</span>{" "}
        to <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalItems}</span> results
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`p-2 rounded-md transition-colors duration-200 ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-memcryptRed hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-memcryptRed focus:ring-opacity-50"
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handlePageChange(1)}
            className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors duration-200 ${
              currentPage === 1
                ? "bg-memcryptRed text-white"
                : "bg-white text-gray-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-memcryptRed focus:ring-opacity-50"
            }`}
            aria-label="Page 1"
            aria-current={currentPage === 1 ? "page" : undefined}
          >
            1
          </button>

          {totalPages <= 3 &&
            Array.from({ length: totalPages - 1 }, (_, i) => i + 2).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors duration-200 ${
                    currentPage === page
                      ? "bg-memcryptRed text-white"
                      : "bg-white text-gray-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-memcryptRed focus:ring-opacity-50"
                  }`}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              )
            )}

          {totalPages > 3 && currentPage > 2 && (
            <span className="w-8 h-8 flex items-center justify-center text-gray-400">
              ...
            </span>
          )}

          {totalPages > 3 && currentPage > 1 && currentPage < totalPages && (
            <button
              onClick={() => handlePageChange(currentPage)}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-memcryptRed text-white"
              aria-label={`Page ${currentPage}`}
              aria-current="page"
            >
              {currentPage}
            </button>
          )}

          {totalPages > 3 && currentPage < totalPages - 1 && (
            <span className="w-8 h-8 flex items-center justify-center text-gray-400">
              ...
            </span>
          )}

          {totalPages > 3 && (
            <button
              onClick={() => handlePageChange(totalPages)}
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors duration-200 ${
                currentPage === totalPages
                  ? "bg-memcryptRed text-white"
                  : "bg-white text-gray-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-memcryptRed focus:ring-opacity-50"
              }`}
              aria-label={`Page ${totalPages}`}
              aria-current={currentPage === totalPages ? "page" : undefined}
            >
              {totalPages}
            </button>
          )}
        </div>

        <button
          onClick={() =>
            handlePageChange(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage === totalPages}
          className={`p-2 rounded-md transition-colors duration-200 ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-memcryptRed hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-memcryptRed focus:ring-opacity-50"
          }`}
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
