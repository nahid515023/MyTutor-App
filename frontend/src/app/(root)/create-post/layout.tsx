import { pageMetadata } from '@/app/metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = pageMetadata.createPost

export default function CreatePostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}