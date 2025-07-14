import { pageMetadata } from '@/app/metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = pageMetadata.meeting

export default function MeetingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}