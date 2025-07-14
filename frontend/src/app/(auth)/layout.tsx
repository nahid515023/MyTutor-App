
import { Metadata } from 'next'
import { pageMetadata } from '@/app/metadata'

export const metadata: Metadata = pageMetadata.verifiedOTP


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}
