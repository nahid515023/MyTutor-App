import React from 'react'
interface PaginationProps {
  currentPage: number
  totalPages: number
  onNext: () => void
  onPrev: () => void
}

const Pagination = ({
  currentPage,
  totalPages,
  onNext,
  onPrev
}: PaginationProps) => {
      return (
        <div className='flex justify-center items-center my-10'> {/* Increased margin */}
          <div className='flex rounded-lg shadow-lg overflow-hidden'> {/* Added overflow-hidden and increased shadow */}
            <button
              className='px-5 py-3 text-sm font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-r border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200' // Enhanced button style
              disabled={currentPage === 1}
              onClick={onPrev}
            >
              « Previous
            </button>
            <div className='px-6 py-3 text-sm font-bold bg-blue-500 text-white border-r border-blue-600 dark:border-blue-700'> {/* Enhanced current page style */}
              Page {currentPage} of {totalPages}
            </div>
            <button
              className='px-5 py-3 text-sm font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200' // Enhanced button style
              disabled={currentPage === totalPages}
              onClick={onNext}
            >
              Next »
            </button>
          </div>
        </div>
      )
    }

export default Pagination
