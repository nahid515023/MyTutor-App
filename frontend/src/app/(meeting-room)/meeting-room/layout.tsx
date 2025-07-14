
import { pageMetadata } from '@/app/metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = pageMetadata.meeting

// Special layout for meeting pages that suppresses the navbar and footer
export default function MeetingAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="meeting-layout" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {children}
    </div>
  )
}