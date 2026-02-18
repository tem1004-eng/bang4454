import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPrev, onNext }) => {
  const buttonClasses = "px-6 py-2 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  return (
    <div className="flex items-center justify-center space-x-6 mb-4 no-print">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className={`${buttonClasses} bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500`}
      >
        Previous
      </button>
      <span className="text-xl font-bold text-gray-700">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className={`${buttonClasses} bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;