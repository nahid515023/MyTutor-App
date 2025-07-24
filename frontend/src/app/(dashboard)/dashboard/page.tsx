"use client";

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBangladeshiTakaSign } from '@fortawesome/free-solid-svg-icons'

import { 
  Users, 
  Shield,
  Settings,
  TrendingUp,
  Activity,
  BookOpen,
  Calendar,
  Mail,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Target,
  Award,
  Zap,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '@/_lib/api'

interface DashboardAnalytics {
  summary: {
    totalUsers: number
    totalPosts: number
    totalMeetings: number
    totalPayments: number
    totalEmailVerifications: number
    activeUsers: number
    blockedUsers: number
    verifiedUsers: number
    recentUsers: number
    recentMeetings: number
  }
  userDistribution: {
    students: number
    teachers: number
    admins: number
  }
  payments: {
    pending: number
    completed: number
    totalRevenue: number
  }
  charts: {
    monthlyUsers: Array<{
      month: string
      students: number
      teachers: number
      total: number
    }>
    dailyActivity: Array<{
      date: string
      meetings: number
      payments: number
    }>
  }
  recentActivities: Array<{
    id: string
    name: string
    email: string
    role: string
    status: string
    verified: boolean
    createdAt: string
    updatedAt: string
  }>
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [loading, setLoading] = useState(true)



  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      console.log('Fetching analytics data...')
      const response = await api.get('/dashboard/analytics')
      console.log('Full response:', response.data)
      
      // The backend returns { message: "...", data: analytics }
      // So we need to access response.data.data to get the actual analytics
      const responseData = response.data as { message: string; data: DashboardAnalytics }
      
      if (responseData && responseData.data) {
        setAnalytics(responseData.data)
        console.log('Analytics data set successfully:', responseData.data)
      } else {
        console.error('No analytics data found in response')
        toast.error('No analytics data received')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      const axiosError = error as { response?: { status: number; data?: { error: string } } }
      
      if (axiosError.response?.status === 401) {
        toast.error('Authentication required. Please log in.')
      } else if (axiosError.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.')
      } else {
        toast.error('Failed to fetch dashboard analytics')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  console.log(analytics)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500">Failed to load dashboard data</p>
          <Button onClick={fetchAnalytics} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const userDistributionData = [
    { name: 'Students', value: analytics.userDistribution.students, color: '#2563EB' },
    { name: 'Teachers', value: analytics.userDistribution.teachers, color: '#059669' },
    { name: 'Admins', value: analytics.userDistribution.admins, color: '#DC2626' }
  ]

  // Create a wrapper component for FontAwesome icon to match Lucide icon pattern
  const TakaIcon = ({ className }: { className?: string }) => (
    <FontAwesomeIcon icon={faBangladeshiTakaSign} className={className} />
  )

  const stats = [
    { 
      title: "Total Users", 
      value: analytics.summary.totalUsers.toString(), 
      icon: Users, 
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: `+${analytics.summary.recentUsers} this week`,
      changeColor: "text-blue-700",
      borderColor: "border-blue-300"
    },
    { 
      title: "Active Users", 
      value: analytics.summary.activeUsers.toString(), 
      icon: Shield, 
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      change: `${((analytics.summary.activeUsers / analytics.summary.totalUsers) * 100).toFixed(1)}% of total`,
      changeColor: "text-emerald-700",
      borderColor: "border-emerald-300"
    },
    { 
      title: "Total payments", 
      value: `${analytics.payments.totalRevenue.toLocaleString()}`, 
      icon: TakaIcon, 
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: `${analytics.payments.completed} completed`,
      changeColor: "text-purple-700",
      borderColor: "border-purple-300"
    },
    { 
      title: "Recent Meetings", 
      value: analytics.summary.recentMeetings.toString(), 
      icon: Calendar, 
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: "Last 7 days",
      changeColor: "text-orange-700",
      borderColor: "border-orange-300"
    },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getActivityText = (activity: DashboardAnalytics['recentActivities'][0]) => {
    const isNew = new Date(activity.createdAt).getTime() === new Date(activity.updatedAt).getTime()
    if (isNew) {
      return `New ${activity.role.toLowerCase()} registered: ${activity.name}`
    } else {
      return `User updated: ${activity.name}`
    }
  }

  const getActivityIcon = (activity: DashboardAnalytics['recentActivities'][0]) => {
    const isNew = new Date(activity.createdAt).getTime() === new Date(activity.updatedAt).getTime()
    if (isNew) {
      return <UserPlus className="h-4 w-4 mr-2 text-emerald-600" />
    } else {
      return <Settings className="h-4 w-4 mr-2 text-blue-600" />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <div className="relative z-10 p-6 lg:p-8">
        {/* Enhanced Header with Interactive Elements */}
        <header className="mb-8 bg-white shadow-lg p-8 rounded-2xl border border-blue-300 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-6xl font-bold text-blue-700">
                    Dashboard
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-emerald-700 font-medium">System Online</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-700 text-lg lg:text-xl max-w-2xl">
                Welcome back! Here&apos;s what&apos;s happening with your tutoring platform today.
              </p>
          
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={fetchAnalytics} 
                variant="outline" 
                className="flex items-center gap-2 hover:shadow-lg transition-all duration-300 bg-white border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
              >
                <RefreshCw className="h-5 w-5" />
                Refresh Data
              </Button>
            </div>
          </div>
        </header>
        
        {/* Enhanced Stats Overview with Interactive Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className={`group hover:shadow-lg shadow-md transition-all duration-300 border ${stat.borderColor} bg-white hover:bg-slate-50 hover:-translate-y-1`}>
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-4 rounded-xl ${stat.bgColor} shadow-md group-hover:scale-105 transition-all duration-300`}>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="text-right">
                    {index === 0 && (
                      <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                    )}
                    {index === 1 && (
                      <div className="h-8 w-8 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                    {index === 2 && (
                      <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <TakaIcon className="h-4 w-4 text-white" />
                      </div>
                    )}
                    {index === 3 && (
                      <div className="h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center shadow-lg">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">{stat.title}</p>
                  <h3 className="text-4xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300">
                    {stat.value}
                  </h3>
                  <p className={`text-sm font-semibold ${stat.changeColor} flex items-center gap-1`}>
                    <TrendingUp className="h-3 w-3" />
                    {stat.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Feature Cards with Modern Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Total Posts Card - Clean Blue Theme */}
          <Card className="group bg-white text-slate-800 border border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="relative">
                  <div className="p-4 bg-blue-600 rounded-2xl shadow-lg group-hover:scale-105 transition-all duration-300">
                    <BookOpen className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
                <Badge className="bg-blue-50 text-blue-800 border-blue-300 px-3 py-1 rounded-full text-xs font-bold">
                  <Sparkles className="h-3 w-3 mr-1 text-blue-700" />
                  Live
                </Badge>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-800">Total Posts</h3>
                <p className="text-5xl font-black text-slate-900">{analytics.summary.totalPosts}</p>
                <div className="flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2 border border-blue-200">
                  <Target className="h-4 w-4 text-blue-700" />
                  <span className="text-slate-700 text-sm font-medium">Knowledge shared across platform</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Verified Users Card - Clean Green Theme */}
          <Card className="group bg-white text-slate-800 border border-emerald-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="relative">
                  <div className="p-4 bg-emerald-600 rounded-2xl shadow-lg group-hover:scale-105 transition-all duration-300">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-bounce"></div>
                </div>
                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
                  <Award className="h-3 w-3 mr-1 text-emerald-700" />
                  Verified
                </Badge>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-800">Verified Users</h3>
                <p className="text-5xl font-black text-slate-900">{analytics.summary.verifiedUsers}</p>
                <div className="flex items-center gap-2 bg-emerald-50 rounded-full px-4 py-2 border border-emerald-200">
                  <Shield className="h-4 w-4 text-emerald-700" />
                  <span className="text-slate-700 text-sm font-medium">Trusted community members</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Email Verifications Card - Clean Orange Theme */}
          <Card className="group bg-white text-slate-800 border border-orange-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="relative">
                  <div className="p-4 bg-orange-600 rounded-2xl shadow-lg group-hover:scale-105 transition-all duration-300">
                    <Mail className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-ping"></div>
                </div>
                <Badge className="bg-orange-50 text-orange-800 border-orange-300 px-3 py-1 rounded-full text-xs font-bold">
                  <Zap className="h-3 w-3 mr-1 text-orange-700" />
                  Pending
                </Badge>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-800">Email Verifications</h3>
                <p className="text-5xl font-black text-slate-900">{analytics.summary.totalEmailVerifications}</p>
                <div className="flex items-center gap-2 bg-orange-50 rounded-full px-4 py-2 border border-orange-200">
                  <Clock className="h-4 w-4 text-orange-700" />
                  <span className="text-slate-700 text-sm font-medium">Awaiting verification</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Charts Section with Modern Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* User Distribution with Enhanced Design */}
          <Card className="group shadow-lg border border-blue-300 bg-white hover:bg-blue-50 transition-all duration-300 hover:-translate-y-2 rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-blue-200 pb-6">
              <CardTitle className="text-xl font-bold text-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 rounded-xl bg-blue-600 mr-3 shadow-lg group-hover:scale-105 transition-all duration-300">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-700">User Distribution</h3>
                      <p className="text-sm text-slate-600">Platform demographics</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-50 text-blue-800 border-blue-300 shadow-lg">
                    <BarChart3 className="h-3 w-3 mr-1 text-blue-700" />
                    Live
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="h-[280px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={120}
                      paddingAngle={8}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={2000}
                    >
                      {userDistributionData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="white"
                          strokeWidth={3}
                          className="hover:brightness-110 transition-all duration-300"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        border: '1px solid #CBD5E1',
                        borderRadius: '16px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                        color: '#1e293b'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-8 mt-6">
                {userDistributionData.map((item, index) => (
                  <div key={index} className="flex items-center group/item hover:bg-white rounded-xl p-3 -m-3 transition-all duration-300 hover:shadow-lg">
                    <div 
                      className="w-5 h-5 rounded-full mr-3 shadow-md group-hover/item:scale-125 transition-all duration-300 border-2 border-white" 
                      style={{ 
                        backgroundColor: item.color,
                        boxShadow: `0 0 15px ${item.color}40`
                      }}
                    ></div>
                    <div className="text-center">
                      <span className="text-sm font-bold text-slate-800 block group-hover/item:text-slate-900 transition-all duration-300">{item.value}</span>
                      <span className="text-xs text-slate-600 group-hover/item:text-slate-700 font-medium">{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly User Growth with Enhanced Design */}
          <Card className="group shadow-lg border border-emerald-300 bg-white hover:bg-emerald-50 transition-all duration-300 hover:-translate-y-2 rounded-2xl overflow-hidden lg:col-span-2">
            <CardHeader className="border-b border-emerald-200 pb-6">
              <CardTitle className="text-xl font-bold text-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 rounded-xl bg-emerald-600 mr-3 shadow-lg group-hover:scale-105 transition-all duration-300">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-emerald-700">Monthly User Growth</h3>
                      <p className="text-sm text-slate-600">Registration trends over time</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-blue-50 text-blue-800 border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300">
                      <Users className="h-3 w-3 mr-1" />
                      Students
                    </Badge>
                    <Badge className="bg-emerald-50 text-emerald-800 border-emerald-300 shadow-lg hover:shadow-xl transition-all duration-300">
                      <Shield className="h-3 w-3 mr-1" />
                      Teachers
                    </Badge>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="h-[280px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.charts.monthlyUsers} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.6} />
                    <XAxis 
                      dataKey="month" 
                      stroke="#64748B" 
                      fontSize={12} 
                      fontWeight="600"
                      tick={{ fill: '#64748B' }}
                      axisLine={{ stroke: '#CBD5E1', strokeWidth: 1 }}
                    />
                    <YAxis 
                      stroke="#64748B" 
                      fontSize={12} 
                      fontWeight="600"
                      tick={{ fill: '#64748B' }}
                      axisLine={{ stroke: '#CBD5E1', strokeWidth: 1 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        border: '1px solid #CBD5E1',
                        borderRadius: '16px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                        color: '#1e293b',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                      cursor={{ fill: 'rgba(16, 185, 129, 0.1)', radius: 8 }}
                    />
                    <Bar 
                      dataKey="students" 
                      fill="#2563EB" 
                      name="Students" 
                      radius={[8, 8, 4, 4]}
                      className="hover:brightness-110 transition-all duration-300"
                    />
                    <Bar 
                      dataKey="teachers" 
                      fill="#059669" 
                      name="Teachers" 
                      radius={[8, 8, 4, 4]}
                      className="hover:brightness-110 transition-all duration-300"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Enhanced stats summary */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-300 hover:shadow-lg transition-all duration-300 group/stat">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Total Students</p>
                      <p className="text-2xl font-black text-blue-800 group-hover/stat:scale-105 transition-transform duration-300">
                        {analytics.charts.monthlyUsers.reduce((sum, month) => sum + month.students, 0)}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-600 rounded-lg shadow-lg group-hover/stat:rotate-6 transition-all duration-300">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-300 hover:shadow-lg transition-all duration-300 group/stat">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Total Teachers</p>
                      <p className="text-2xl font-black text-emerald-800 group-hover/stat:scale-105 transition-transform duration-300">
                        {analytics.charts.monthlyUsers.reduce((sum, month) => sum + month.teachers, 0)}
                      </p>
                    </div>
                    <div className="p-2 bg-emerald-600 rounded-lg shadow-lg group-hover/stat:rotate-6 transition-all duration-300">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Daily Activity Chart */}
        <Card className="group mb-8 shadow-lg border border-amber-300 bg-white hover:bg-amber-50 transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-amber-200 pb-6">
            <CardTitle className="text-xl font-bold text-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-amber-600 mr-3 shadow-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg text-amber-700 font-bold">Daily Activity Trends</h3>
                    <p className="text-sm text-slate-600">Platform engagement over time</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-emerald-50 text-emerald-800 border-emerald-300">
                    <Calendar className="h-3 w-3 mr-1" />
                    Meetings
                  </Badge>
                  <Badge className="bg-amber-50 text-amber-800 border-amber-300">
                    <TakaIcon className="h-3 w-3 mr-1" />
                    Payments
                  </Badge>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.charts.dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={12} fontWeight="500" />
                  <YAxis stroke="#64748B" fontSize={12} fontWeight="500" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #CBD5E1',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="meetings" 
                    stroke="#059669" 
                    strokeWidth={4}
                    dot={{ fill: '#059669', strokeWidth: 3, r: 8 }}
                    name="Meetings"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="payments" 
                    stroke="#D97706" 
                    strokeWidth={4}
                    dot={{ fill: '#D97706', strokeWidth: 3, r: 8 }}
                    name="Payments"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Enhanced Recent Activity with Modern Design */}
        <Card className="group mb-8 shadow-lg border border-indigo-300 bg-white hover:bg-indigo-50 transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-indigo-200 pb-6">
            <CardTitle className="text-xl font-bold text-slate-800">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-indigo-600 mr-3 shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-indigo-700">Recent System Activity</h3>
                  <p className="text-sm text-slate-600">Latest platform updates</p>
                </div>
              </div>
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              className="text-indigo-700 hover:text-indigo-800 border-indigo-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300"
            >
              <Eye className="h-4 w-4 mr-2" />
              View All Activity
            </Button>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {analytics.recentActivities.slice(0, 8).map((activity) => (
                <div key={activity.id} className="group/item flex items-center justify-between border-b border-slate-200 pb-6 last:border-b-0 hover:bg-indigo-50 rounded-xl p-4 -m-4 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center">
                    <div className="mr-4 p-2 rounded-lg shadow-lg">
                      {getActivityIcon(activity)}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-bold text-slate-800 group-hover/item:text-slate-900 transition-colors duration-300 block mb-2">
                        {getActivityText(activity)}
                      </span>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={activity.role === "TEACHER" ? "default" : "secondary"}
                          className={`text-xs font-medium rounded-full ${
                            activity.role === "TEACHER" 
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300" 
                              : "bg-orange-50 text-orange-800 border-orange-300"
                          }`}
                        >
                          {activity.role}
                        </Badge>
                        <Badge 
                          variant={activity.status === "ACTIVE" ? "default" : "destructive"}
                          className={`text-xs font-medium rounded-full ${
                            activity.status === "ACTIVE"
                              ? "bg-blue-50 text-blue-800 border-blue-300"
                              : "bg-red-50 text-red-800 border-red-300"
                          }`}
                        >
                          {activity.status}
                        </Badge>
                        {activity.verified && (
                          <Badge className="text-xs text-emerald-800 bg-emerald-50 border-emerald-300 rounded-full">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-medium block">
                      {formatDate(activity.updatedAt)}
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-emerald-700">Live</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
