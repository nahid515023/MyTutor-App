import { toast, ToastContent, ToastOptions, Slide, Id } from 'react-toastify'

// Default toast options
export const defaultToastOptions: ToastOptions = {
  position: 'top-center',
  autoClose: 3000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'colored',
  transition: Slide
}

// Toast type definition
type ToastType = 'success' | 'error' | 'info' | 'warning' | 'default'

/**
 * Display toast
 *
 * @param {ToastType} type - Type of toast
 * @param {ToastContent} content - Toast message
 * @param {Partial<ToastOptions>} [options={}] - Optional configuration for toast
 * @return {Id} - Toast ID
 */
export const showToast = (
  type: ToastType,
  content: ToastContent,
  options: Partial<ToastOptions> = {} 
): Id => {
  const optionsToApply: ToastOptions = { ...defaultToastOptions, ...options }

  switch (type) {
    case 'success':
      return toast.success(content, optionsToApply)
    case 'error':
      return toast.error(content, optionsToApply)
    case 'info':
      return toast.info(content, optionsToApply)
    case 'warning':
      return toast.warn(content, optionsToApply)
    default:
      return toast(content, optionsToApply)
  }
}
