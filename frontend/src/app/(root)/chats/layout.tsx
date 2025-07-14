import { pageMetadata } from '@/app/metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = pageMetadata.chat

export default function ChatsLayout({
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