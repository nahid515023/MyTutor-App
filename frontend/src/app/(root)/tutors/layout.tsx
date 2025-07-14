
import type { Metadata } from 'next'
import {pageMetadata} from '@/app/metadata'

export const metadata: Metadata = pageMetadata.tutor

export default function TutorsLayout ({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div>
      {children}
    </div>
  )
}
