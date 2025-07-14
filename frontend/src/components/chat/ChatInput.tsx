import React, { RefObject, ChangeEvent, KeyboardEvent } from 'react'

interface ChatInputProps {
  inputValue: string
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
  onSend: () => void
  inputRef: RefObject<HTMLInputElement | null>
  fileInputRef: RefObject<HTMLInputElement | null>
}

export const ChatInput = ({
  inputValue,
  onInputChange,
  onKeyDown,
  onSend,
  inputRef,
}: ChatInputProps) => {
  return (
    <footer className='p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-auto'>
      <div className='flex gap-2'>
        <input
          ref={inputRef}
          type='text'
          value={inputValue}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          placeholder='Type a message...'
          className='flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
        <button
          onClick={onSend}
          disabled={!inputValue.trim()}
          className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Send
        </button>
      </div>
    </footer>
  )
} 