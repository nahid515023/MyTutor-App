'use client'
import { FooterPage } from '@/components/FooterPage'
import Nav from '@/components/Nav'
import { RouteGuard } from '@/components/guards/RouteGuard'

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Temporarily disabled route guard for testing */}
      <RouteGuard requireAuth={true} requireActiveAccount={true}>
        <Nav />
        {children}
        <FooterPage />
      </RouteGuard>
    </>
  )
}