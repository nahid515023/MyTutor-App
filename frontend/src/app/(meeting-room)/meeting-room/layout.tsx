
import { pageMetadata } from '@/app/metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = pageMetadata.meeting

// Layout for meeting pages that includes navbar but optimizes for meeting experience
export default function MeetingAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="meeting-layout">
      {children}
    </div>
  )
}