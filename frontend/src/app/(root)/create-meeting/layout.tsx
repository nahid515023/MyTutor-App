import { pageMetadata } from '@/app/metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = pageMetadata.home

export default function createMeetingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}