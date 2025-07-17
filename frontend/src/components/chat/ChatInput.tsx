import React, { RefObject, ChangeEvent, KeyboardEvent } from 'react'

interface ChatInputProps {
  inputValue: string
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
  onSend: () => void
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void
  inputRef: RefObject<HTMLInputElement | null>
  fileInputRef: RefObject<HTMLInputElement | null>
  isUploading?: boolean
}

export const ChatInput = ({
  inputValue,
  onInputChange,
  onKeyDown,
  onSend,
  onImageUpload,
  inputRef,
  fileInputRef,
  isUploading = false
}: ChatInputProps) => {
  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <footer className='p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-auto'>
      <div className='flex gap-2 items-end'>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={onImageUpload}
          className='hidden'
        />
        
        <button
          onClick={handleImageClick}
          disabled={isUploading}
          className='p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50'
          title='Attach image'
        >
          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13' />
          </svg>
        </button>

        <input
          ref={inputRef}
          type='text'
          value={inputValue}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          placeholder='Type a message...'
          disabled={isUploading}
          className='flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50'
        />
        
        <button
          onClick={onSend}
          disabled={!inputValue.trim() || isUploading}
          className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          {isUploading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Uploading...
            </div>
          ) : (
            'Send'
          )}
        </button>
      </div>
    </footer>
  )
} 