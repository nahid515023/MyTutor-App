import { pageMetadata } from '@/app/metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = pageMetadata.post

export default function PostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}