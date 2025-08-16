import { pageMetadata } from '@/app/metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = pageMetadata.payment

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}