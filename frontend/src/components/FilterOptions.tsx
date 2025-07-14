import React from 'react'

interface FilterOptionsProps {
  filterClass: string
  filterSubject: string
  filterMedium: string
  onFilterChange: (
    filterName: 'class' | 'subject' | 'medium',
    value: string
  ) => void
  onClearFilters: () => void
}

const FilterOptions = ({
  filterClass,
  filterSubject,
  filterMedium,
  onFilterChange,
  onClearFilters
}: FilterOptionsProps) => {
  const hasActiveFilters = filterClass || filterSubject || filterMedium

  return (
    <div className='space-y-8'>
      {/* Filter header */}
      <div className='relative'>
        <div className='absolute inset-0 bg-gradient-to-r from-blue-500/10 to-amber-500/10 rounded-xl blur'></div>
        <div className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200 dark:border-blue-900'>
          <p className='text-sm text-gray-600 dark:text-gray-400 text-center'>
            Find the perfect tutor by applying filters below
          </p>
        </div>
      </div>

      {/* Filter options */}
      <div className='space-y-6'>
        {/* Medium Filter */}
        <div className='relative w-full group transition-all duration-300 transform hover:scale-[1.02]'>
          <div className='absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-blue-300 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200'></div>
          <div className='relative'>
            <label className='flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2'>
              <svg className='w-4 h-4 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129' />
              </svg>
              Medium
            </label>
            <div className='relative rounded-xl overflow-hidden'>
              <select
                value={filterMedium}
                onChange={e => onFilterChange('medium', e.target.value)}
                className='w-full px-5 py-3.5 bg-white dark:bg-gray-700 border-2 border-blue-200 dark:border-blue-800 text-gray-800 dark:text-gray-100 font-medium focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 rounded-xl appearance-none cursor-pointer transition-all shadow-sm hover:shadow-md text-base'
              >
                <option value=''>All Mediums</option>
                <option value='English medium'>English Medium</option>
                <option value='Bangla version'>Bangla Version</option>
                <option value='English version'>English Version</option>
              </select>
              <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                <div className='p-1.5 bg-blue-100 dark:bg-blue-900 rounded-full'>
                  <svg className='w-4 h-4 text-blue-600 dark:text-blue-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Class Filter */}
        <div className='relative w-full group transition-all duration-300 transform hover:scale-[1.02]'>
          <div className='absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-blue-300 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200'></div>
          <div className='relative'>
            <label className='flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2'>
              <svg className='w-4 h-4 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
              </svg>
              Class
            </label>
            <div className='relative rounded-xl overflow-hidden'>
              <select
                value={filterClass}
                onChange={e => onFilterChange('class', e.target.value)}
                className='w-full px-5 py-3.5 bg-white dark:bg-gray-700 border-2 border-blue-200 dark:border-blue-800 text-gray-800 dark:text-gray-100 font-medium focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 rounded-xl appearance-none cursor-pointer transition-all shadow-sm hover:shadow-md text-base'
              >
                <option value=''>All Classes</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={(i + 1).toString()}>
                    Class {i + 1}
                  </option>
                ))}
              </select>
              <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                <div className='p-1.5 bg-blue-100 dark:bg-blue-900 rounded-full'>
                  <svg className='w-4 h-4 text-blue-600 dark:text-blue-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Filter */}
        <div className='relative w-full group transition-all duration-300 transform hover:scale-[1.02]'>
          <div className='absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-blue-300 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200'></div>
          <div className='relative'>
            <label className='flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2'>
              <svg className='w-4 h-4 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
              </svg>
              Subject
            </label>
            <div className='relative rounded-xl overflow-hidden'>
              <select
                value={filterSubject}
                onChange={e => onFilterChange('subject', e.target.value)}
                className='w-full px-5 py-3.5 bg-white dark:bg-gray-700 border-2 border-blue-200 dark:border-blue-800 text-gray-800 dark:text-gray-100 font-medium focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 rounded-xl appearance-none cursor-pointer transition-all shadow-sm hover:shadow-md text-base'
              >
                <option value=''>All Subjects</option>
                <option value='English'>English</option>
                <option value='Bangla'>Bangla</option>
                <option value='Mathematics'>Mathematics</option>
                <option value='Science'>Science</option>
                <option value='History'>History</option>
                <option value='Geography'>Geography</option>
                <option value='Physics'>Physics</option>
                <option value='Chemistry'>Chemistry</option>
                <option value='Biology'>Biology</option>
              </select>
              <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                <div className='p-1.5 bg-blue-100 dark:bg-blue-900 rounded-full'>
                  <svg className='w-4 h-4 text-blue-600 dark:text-blue-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active filter indicators */}
      {hasActiveFilters && (
        <div className='space-y-5'>
          {/* Clear filters button */}
          <div className='flex justify-center'>
            <button
              onClick={onClearFilters}
              className='group relative inline-flex items-center justify-center px-6 py-3 overflow-hidden text-sm font-semibold text-blue-600 dark:text-blue-300 rounded-lg transition-all duration-300'
            >
              <span className='absolute w-0 h-0 transition-all duration-500 ease-out bg-blue-600 dark:bg-blue-700 rounded-full group-hover:w-56 group-hover:h-56'></span>
              <span className='absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-blue-200 dark:to-blue-900'></span>
              <span className='relative flex items-center gap-2'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
                <span className='group-hover:text-white transition-colors duration-300'>Clear All Filters</span>
              </span>
            </button>
          </div>
          
          {/* Active filters display */}
          <div className='flex flex-wrap justify-center gap-3'>
            {filterMedium && (
              <span className='group relative inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 rounded-full shadow-sm overflow-hidden'>
                <span className='absolute inset-0 bg-blue-100 dark:bg-blue-800/30 w-full h-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300'></span>
                <svg className='relative w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129' />
                </svg>
                <span className='relative'>{filterMedium}</span>
                <button
                  onClick={() => onFilterChange('medium', '')}
                  className='relative ml-1 w-5 h-5 flex items-center justify-center rounded-full bg-blue-200 dark:bg-blue-700 text-blue-600 dark:text-blue-300 hover:bg-blue-300 dark:hover:bg-blue-600 transition-colors'
                >
                  ×
                </button>
              </span>
            )}
            
            {filterClass && (
              <span className='group relative inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 rounded-full shadow-sm overflow-hidden'>
                <span className='absolute inset-0 bg-blue-100 dark:bg-blue-800/30 w-full h-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300'></span>
                <svg className='relative w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
                </svg>
                <span className='relative'>Class {filterClass}</span>
                <button
                  onClick={() => onFilterChange('class', '')}
                  className='relative ml-1 w-5 h-5 flex items-center justify-center rounded-full bg-blue-200 dark:bg-blue-700 text-blue-600 dark:text-blue-300 hover:bg-blue-300 dark:hover:bg-blue-600 transition-colors'
                >
                  ×
                </button>
              </span>
            )}
            
            {filterSubject && (
              <span className='group relative inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 rounded-full shadow-sm overflow-hidden'>
                <span className='absolute inset-0 bg-blue-100 dark:bg-blue-800/30 w-full h-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300'></span>
                <svg className='relative w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                </svg>
                <span className='relative'>{filterSubject}</span>
                <button
                  onClick={() => onFilterChange('subject', '')}
                  className='relative ml-1 w-5 h-5 flex items-center justify-center rounded-full bg-blue-200 dark:bg-blue-700 text-blue-600 dark:text-blue-300 hover:bg-blue-300 dark:hover:bg-blue-600 transition-colors'
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Apply filters action */}
      {hasActiveFilters && (
        <div className='pt-2'>
          <div className='relative'>
            <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-amber-500 rounded-xl blur-sm opacity-30'></div>
            <div className='relative p-1 bg-gradient-to-r from-blue-500 to-amber-500 rounded-xl'>
              <div className='bg-white dark:bg-gray-800 rounded-lg p-1'>
                <p className='text-center text-sm text-gray-600 dark:text-gray-400'>
                  <span className='font-semibold text-blue-600 dark:text-blue-400'>{
                    [
                      filterClass ? `Class ${filterClass}` : '',
                      filterSubject ? filterSubject : '',
                      filterMedium ? filterMedium : ''
                    ].filter(Boolean).join(' • ')
                  }</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterOptions
