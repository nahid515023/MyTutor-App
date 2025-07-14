import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBangladeshiTakaSign } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'

interface CurrencyDisplayProps {
  amount: number | string
  className?: string
  iconClassName?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: { container: 'gap-1', icon: 'text-sm', text: 'text-sm' },
  md: { container: 'gap-2', icon: 'text-base', text: 'text-base' },
  lg: { container: 'gap-2', icon: 'text-lg', text: 'text-lg' },
  xl: { container: 'gap-2', icon: 'text-2xl', text: 'text-2xl' }
}

export function CurrencyDisplay({ 
  amount, 
  className = '', 
  iconClassName = '',
  showIcon = true,
  size = 'md'
}: CurrencyDisplayProps) {
  const formattedAmount = typeof amount === 'number' 
    ? amount.toLocaleString() 
    : amount

  const sizeClass = sizeClasses[size]

  return (
    <div className={cn(`flex items-center ${sizeClass.container}`, className)}>
      {showIcon && (
        <FontAwesomeIcon 
          icon={faBangladeshiTakaSign} 
          className={cn(`${sizeClass.icon}`, iconClassName)} 
        />
      )}
      <span className={sizeClass.text}>{formattedAmount}</span>
    </div>
  )
}

export default CurrencyDisplay
