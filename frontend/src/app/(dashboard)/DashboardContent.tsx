'use client'

import { useSidebar } from '@/contexts/SidebarContext'

interface DashboardContentProps {
  children: React.ReactNode
}

export default function DashboardContent({ children }: DashboardContentProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div className={`flex flex-col overflow-x-hidden relative z-10 transition-all duration-500 ease-in-out ${
      isCollapsed ? 'ml-20' : 'ml-72'
    }`}>
      <main className='flex-1 overflow-auto'>
        {children}
      </main>
    </div>
  )
}
