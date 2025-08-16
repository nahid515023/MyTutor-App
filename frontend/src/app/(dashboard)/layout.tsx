'use client'

import { Sidebar } from '@/components/Sidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute'
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext'

function DashboardContentWrapper({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()

  return (
    <div className={`flex flex-col w-full overflow-x-hidden relative z-10 transition-all duration-500 ease-in-out ${
      isCollapsed ? 'ml-20' : 'ml-72'
    }`}>
      <main className='flex-1 overflow-auto'>
        {children}
      </main>
    </div>
  )
}

export default function DashboardLayout ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <AdminProtectedRoute>
          <AdminHeader />
      <SidebarProvider>
        <div className='flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden'>
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/3 -right-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
          <Sidebar />
          <DashboardContentWrapper>
            {children}
          </DashboardContentWrapper>
        </div>
      </SidebarProvider>
   </AdminProtectedRoute>
  )
}
