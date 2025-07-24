import Link from 'next/link'
import { CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaymentHistoryButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function PaymentHistoryButton({ 
  variant = 'default',
  size = 'default',
  className = ''
}: PaymentHistoryButtonProps) {
  return (
    <Link href="/payment-history">
      <Button 
        variant={variant} 
        size={size}
        className={`inline-flex items-center gap-2 ${className}`}
      >
        <CreditCard className="w-4 h-4" />
        Payment History
      </Button>
    </Link>
  )
}
