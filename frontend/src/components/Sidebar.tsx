'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import { 
  Users,  
  Settings, 
  BarChart,
  MessageSquare,
  LogOut,
  FileText,
  CreditCard,
  Video,
  Mail,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", icon: BarChart, href: "/dashboard" },
  { title: "Users", icon: Users, href: "/dashboard/users" },
  { title: "Posts", icon: FileText, href: "/dashboard/post" },
  { title: "Payments", icon: CreditCard, href: "/dashboard/payment" },
  { title: "Meetings", icon: Video, href: "/dashboard/meeting" },
  { title: "Email Verifications", icon: Mail, href: "/dashboard/email-verification" },
  { title: "Messages", icon: MessageSquare, href: "/dashboard/messages" },
  { title: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export function Sidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className={`fixed left-0 top-0 z-40 flex flex-col h-screen bg-gradient-to-b from-white via-slate-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-r border-slate-200/50 dark:border-gray-700/50 shadow-xl backdrop-blur-xl transition-all duration-500 ease-in-out overflow-hidden ${
      isCollapsed ? 'w-20' : 'w-72'
    }`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-200/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-10 w-40 h-40 bg-blue-200/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-10 left-1/2 w-36 h-36 bg-indigo-200/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="px-4 py-6 border-b border-slate-200/50 dark:border-gray-700/50 relative z-10">
        {!isCollapsed ? (
          // Expanded state - logo and toggle button side by side
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <GraduationCap className="h-7 w-7 text-white animate-pulse" />
              </div>
              <div className="transition-all duration-300 ease-in-out">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                  MyTutor
                </h2>
                <p className="text-xs text-slate-600 dark:text-gray-400 font-medium tracking-wider">
                  Administration
                </p>
              </div>
            </div>
            
            {/* Toggle Button for expanded state */}
            <button
              onClick={toggleSidebar}
              className="p-2 bg-white/50 dark:bg-gray-800/50 text-slate-600 dark:text-gray-300 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white backdrop-blur-sm group"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            </button>
          </div>
        ) : (
          // Collapsed state - stacked layout
          <div className="flex flex-col items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
              <GraduationCap className="h-6 w-6 text-white animate-pulse" />
            </div>
            
            {/* Toggle Button for collapsed state */}
            <button
              onClick={toggleSidebar}
              className="p-2 bg-white/50 dark:bg-gray-800/50 text-slate-600 dark:text-gray-300 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white backdrop-blur-sm group"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            </button>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 relative z-10">
        <div className="space-y-2">
          {menuItems.map((item, index) => {
            const active = isActive(item.href);
            return (
            <Link
              key={item.title}
              href={item.href}
              className={`group relative flex items-center rounded-2xl px-4 py-3 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] backdrop-blur-sm ${
                isCollapsed ? 'justify-center' : 'gap-4'
              } ${
                active 
                  ? 'text-white bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg' 
                  : 'text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-gray-800/70'
              }`}
              style={{ 
                animationDelay: `${index * 50}ms`,
                animation: 'fadeInUp 0.5s ease-out forwards'
              }}
            >
              {/* Background gradient on hover for inactive items */}
              {!active && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              )}
              
              {/* Icon container */}
              <div className={`relative p-2 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-110 ${
                active 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/50 dark:bg-gray-700/50 group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-blue-500'
              }`}>
                <item.icon className={`h-5 w-5 transition-all duration-300 ${
                  active ? 'text-white' : 'group-hover:text-white'
                }`} />
              </div>
              
              {/* Text */}
              {!isCollapsed && (
                <div className="relative">
                  <span className="font-semibold text-sm tracking-wide">{item.title}</span>
                  <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300 ${
                    active ? 'w-full bg-white' : 'w-0 group-hover:w-full'
                  }`}></div>
                </div>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50 shadow-xl">
                  {item.title}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}
            </Link>
          );
          })}
        </div>
      </nav>
      
      {/* Logout Button */}
      <div className="border-t border-slate-200/50 dark:border-gray-700/50 p-4 relative z-10">
        <button className={`group relative flex w-full items-center rounded-2xl px-4 py-3 text-red-600 dark:text-red-400 transition-all duration-300 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:shadow-lg hover:scale-[1.02] font-semibold backdrop-blur-sm ${
          isCollapsed ? 'justify-center' : 'gap-4'
        }`}>
          {/* Background gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
          
          {/* Icon container */}
          <div className="relative p-2 rounded-xl bg-red-50 dark:bg-red-900/20 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-white">
            <LogOut className="h-5 w-5 transition-all duration-300 group-hover:text-red-500" />
          </div>
          
          {/* Text */}
          {!isCollapsed && (
            <div className="relative">
              <span className="text-sm tracking-wide">Logout</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full transition-all duration-300 group-hover:w-full"></div>
            </div>
          )}
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50 shadow-xl">
              Logout
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          )}
        </button>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
