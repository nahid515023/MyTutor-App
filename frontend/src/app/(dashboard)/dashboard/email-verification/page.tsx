'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Trash2, 
  Search, 
  RefreshCw, 
  Mail, 
  Clock, 
  User, 
  Shield, 
  X, 
  Activity,
  TrendingUp,
  Filter,
  AlertTriangle,
  Check,
  Loader2
} from 'lucide-react'
import { api } from '@/_lib/api'

interface EmailVerification {
  id: string
  userId: string
  token: string
  createdAt: string
  updatedAt: string
  User: {
    id: string
    name: string
    email: string
    verified: boolean
    role: string
    status: string
  }
}

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

const EmailVerificationDashboard = () => {
  const [emailVerifications, setEmailVerifications] = useState<EmailVerification[]>([])
  const [filteredVerifications, setFilteredVerifications] = useState<EmailVerification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [verificationToDelete, setVerificationToDelete] = useState<EmailVerification | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  // Enhanced toast management
  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString()
    const newToast: Toast = { id, message, type }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 5000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const fetchEmailVerifications = useCallback(async () => {
    try {
      const response = await api.get('/dashboard/email-verifications')
      setEmailVerifications(response.data as EmailVerification[])
      setFilteredVerifications(response.data as EmailVerification[])
    } catch (error) {
      showToast('Failed to fetch email verifications', 'error')
      console.error('Error fetching email verifications:', error)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchEmailVerifications()
  }, [fetchEmailVerifications])

  useEffect(() => {
    let filtered = emailVerifications

    if (searchTerm) {
      filtered = filtered.filter(verification =>
        verification.User.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        verification.User.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        verification.token.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(verification => 
        statusFilter === 'verified' ? verification.User.verified : !verification.User.verified
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(verification => verification.User.role === roleFilter)
    }

    setFilteredVerifications(filtered)
  }, [searchTerm, statusFilter, roleFilter, emailVerifications])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setStatusFilter('all')
    setRoleFilter('all')
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/dashboard/email-verifications/${id}`)
      showToast('Email verification deleted successfully')
      fetchEmailVerifications()
      setIsDeleteDialogOpen(false)
    } catch (error) {
      showToast('Failed to delete email verification', 'error')
      console.error('Error deleting email verification:', error)
    }
  }

  const handleResend = async (id: string) => {
    try {
      await api.put(`/dashboard/email-verifications/${id}/resend`)
      showToast('Email verification resent successfully')
      fetchEmailVerifications()
    } catch (error) {
      showToast('Failed to resend email verification', 'error')
      console.error('Error resending email verification:', error)
    }
  }

  // Dialog helpers
  const openDeleteDialog = useCallback((verification: EmailVerification) => {
    setVerificationToDelete(verification)
    setIsDeleteDialogOpen(true)
  }, [])

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false)
    setVerificationToDelete(null)
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-50 text-red-800 border-red-300'
      case 'TEACHER': return 'bg-blue-50 text-blue-800 border-blue-300'
      case 'STUDENT': return 'bg-emerald-50 text-emerald-800 border-emerald-300'
      default: return 'bg-slate-50 text-slate-800 border-slate-300'
    }
  }

  const getStatusBadgeColor = (verified: boolean) => {
    return verified 
      ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
      : 'bg-orange-50 text-orange-800 border-orange-300'
  }

  // Enhanced toast styling with solid backgrounds
  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-600 border-emerald-300'
      case 'error':
        return 'bg-red-600 border-red-300'
      case 'info':
        return 'bg-blue-600 border-blue-300'
      default:
        return 'bg-slate-600 border-slate-300'
    }
  }

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5 text-white drop-shadow-sm" />
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-white drop-shadow-sm" />
      case 'info':
        return <Mail className="h-5 w-5 text-white drop-shadow-sm" />
      default:
        return <Check className="h-5 w-5 text-white drop-shadow-sm" />
    }
  }

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const pendingCount = emailVerifications.filter(v => !v.User.verified).length
    const verifiedCount = emailVerifications.filter(v => v.User.verified).length
    
    return {
      total: emailVerifications.length,
      pending: pendingCount,
      verified: verifiedCount,
      active: verifiedCount
    }
  }, [emailVerifications])

  // Show loading state during initial fetch
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-8 bg-white rounded-2xl shadow-xl border border-blue-300">
            <Loader2 className="h-16 w-16 animate-spin mx-auto mb-6 text-blue-600" />
            <p className="text-slate-600 text-xl font-medium">Loading email verifications...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 lg:p-8">
        {/* Enhanced Header with Interactive Elements */}
        <header className="mb-8 bg-white p-8 rounded-2xl shadow-lg border border-blue-300">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-6xl font-bold text-blue-700">
                    Email Verification
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-2 w-2 bg-emerald-600 rounded-full animate-pulse"></div>
                    <span className="text-sm text-emerald-700 font-medium">System Online</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-600 text-lg lg:text-xl max-w-2xl">
                Manage user email verification tokens and monitor verification status ({summaryStats.total} total verifications)
              </p>
              
            </div>
            <div className="flex gap-3">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="flex items-center gap-2 hover:shadow-lg transition-all duration-300 bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Filter className="h-5 w-5" />
                Clear Filters
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex items-center gap-2 bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-700 hover:-translate-y-1"
              >
                <RefreshCw className="h-5 w-5" />
                Refresh Data
              </Button>
              
            </div>
          </div>
        </header>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="group hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 border border-blue-300 rounded-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-2xl bg-blue-50 group-hover:scale-105 transition-all duration-300 shadow-md">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Total Verifications</p>
                <h3 className="text-4xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300">
                  {summaryStats.total}
                </h3>
                <p className="text-sm font-semibold text-blue-700 flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  All verification tokens
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 border border-orange-300 rounded-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-2xl bg-orange-50 group-hover:scale-105 transition-all duration-300 shadow-md">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <div className="text-right">
                  <div className="h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center shadow-lg">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Pending</p>
                <h3 className="text-4xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300">
                  {summaryStats.pending}
                </h3>
                <p className="text-sm font-semibold text-orange-700 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Awaiting verification
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 border border-emerald-300 rounded-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-2xl bg-emerald-50 group-hover:scale-105 transition-all duration-300 shadow-md">
                  <Shield className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="text-right">
                  <div className="h-8 w-8 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Verified</p>
                <h3 className="text-4xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300">
                  {summaryStats.verified}
                </h3>
                <p className="text-sm font-semibold text-emerald-700 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Email confirmed
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 border border-purple-300 rounded-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-2xl bg-purple-50 group-hover:scale-105 transition-all duration-300 shadow-md">
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-right">
                  <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Success Rate</p>
                <h3 className="text-4xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300">
                  {summaryStats.total > 0 ? Math.round((summaryStats.verified / summaryStats.total) * 100) : 0}%
                </h3>
                <p className="text-sm font-semibold text-purple-700 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Verification rate
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Table Card */}
        <Card className="group shadow-xl border border-blue-300 bg-white hover:-translate-y-1 transition-all duration-300 rounded-2xl">
          <CardHeader className="border-b border-slate-200 pb-6">
            <CardTitle className="text-xl font-bold text-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 rounded-2xl bg-blue-600 mr-3 shadow-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Email Verifications</h3>
                    <p className="text-sm text-slate-600">
                      {filteredVerifications.length !== emailVerifications.length 
                        ? `${filteredVerifications.length} filtered from ${emailVerifications.length} total` 
                        : `${emailVerifications.length} total verifications`}
                    </p>
                  </div>
                </div>
                <Badge className="bg-blue-50 text-blue-800 border-blue-300">
                  <Activity className="h-3 w-3 mr-1" />
                  Live Data
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            {/* Enhanced Filter Section */}
            <Card className="shadow-lg border border-indigo-300 bg-white rounded-2xl mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Advanced Filters</h3>
                <p className="text-slate-600 text-sm mb-6">Filter by search term, verification status, or user role</p>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, email, or token..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white border-slate-300 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48 bg-white border-slate-300 focus:border-blue-500 transition-all duration-300">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full md:w-48 bg-white border-slate-300 focus:border-blue-500 transition-all duration-300">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="TEACHER">Teacher</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {(searchTerm || statusFilter !== 'all' || roleFilter !== 'all') && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('')
                        setStatusFilter('all')
                        setRoleFilter('all')
                      }}
                      className="text-slate-600 bg-white border-slate-300 hover:bg-slate-50 transition-all duration-300"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Table Content */}
            {filteredVerifications.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mb-8">
                  <div className="p-6 bg-blue-600 rounded-3xl shadow-2xl mx-auto w-fit">
                    <Mail className="h-16 w-16 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  No email verifications found
                </h3>
                <p className="text-slate-600 text-lg max-w-md mx-auto mb-6">
                  {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                    ? 'No verifications match your current search criteria'
                    : 'No email verifications available to display'}
                </p>
                {(searchTerm || statusFilter !== 'all' || roleFilter !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setRoleFilter('all')
                    }}
                    className="bg-white border-slate-300 hover:bg-slate-50 transition-all duration-300 hover:scale-105"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear all filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl shadow-lg">
                <table className="w-full table-auto relative">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="hover:bg-slate-100/80 transition-all duration-300">
                      <th className="text-left p-4 font-bold text-slate-800 uppercase tracking-wider text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-600" />
                          User
                        </div>
                      </th>
                      <th className="text-left p-4 font-bold text-slate-800 uppercase tracking-wider text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-600" />
                          Email
                        </div>
                      </th>
                      <th className="text-left p-4 font-bold text-slate-800 uppercase tracking-wider text-sm">Role</th>
                      <th className="text-left p-4 font-bold text-slate-800 uppercase tracking-wider text-sm">Status</th>
                      <th className="text-left p-4 font-bold text-slate-800 uppercase tracking-wider text-sm">Token</th>
                      <th className="text-left p-4 font-bold text-slate-800 uppercase tracking-wider text-sm">Created</th>
                      <th className="text-left p-4 font-bold text-slate-800 uppercase tracking-wider text-sm">Updated</th>
                      <th className="text-left p-4 font-bold text-slate-800 uppercase tracking-wider text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {filteredVerifications.map((verification, index) => (
                      <tr 
                        key={verification.id} 
                        className="hover:bg-blue-50 transition-all duration-500 hover:shadow-lg hover:scale-[1.02] border-b border-slate-100/50 group"
                        style={{ 
                          animationDelay: `${index * 50}ms`,
                          animation: 'fadeInUp 0.5s ease-out forwards'
                        }}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-semibold text-slate-800">{verification.User.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-slate-600 font-medium">{verification.User.email}</div>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getRoleBadgeColor(verification.User.role)} font-semibold shadow-md border-0`}>
                            {verification.User.role}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getStatusBadgeColor(verification.User.verified)} font-semibold shadow-md border-0`}>
                            {verification.User.verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <code className="text-xs bg-slate-100 px-3 py-2 rounded-lg font-mono shadow-sm">
                            {verification.token.substring(0, 20)}...
                          </code>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-slate-600 font-medium">{formatDate(verification.createdAt)}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-slate-600 font-medium">{formatDate(verification.updatedAt)}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {!verification.User.verified && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResend(verification.id)}
                                className="bg-white border-blue-300 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 hover:scale-105"
                              >
                                <Mail className="h-4 w-4 mr-1" />
                                Resend
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDeleteDialog(verification)}
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 transition-all duration-300 hover:scale-105 hover:shadow-md bg-white"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Toast Notifications */}
      <div className="fixed top-6 right-6 z-50 space-y-3 max-w-sm">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className={`group relative p-5 rounded-2xl shadow-xl border transform transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-2xl ${getToastStyles(toast.type)}`}
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
            role="alert"
            aria-live="polite"
          >
            <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
            
            <div className="absolute top-2 right-2 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse delay-700"></div>
            
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-shrink-0 p-2 rounded-xl bg-white/20 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                  {getToastIcon(toast.type)}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm font-semibold leading-relaxed text-white drop-shadow-sm">
                    {toast.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 opacity-70 hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95"
                aria-label="Close notification"
              >
                <X className="h-4 w-4 text-white drop-shadow-sm" />
              </button>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-2xl overflow-hidden">
              <div 
                className="h-full bg-white/40 rounded-b-2xl transition-all duration-[5000ms] ease-linear"
                style={{ width: '0%' }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Delete Confirmation Dialog */}
      {isDeleteDialogOpen && verificationToDelete && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closeDeleteDialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div 
            className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-slate-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-red-600 rounded-2xl mr-4 shadow-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 id="delete-dialog-title" className="text-xl font-bold text-slate-900">
                  Delete Email Verification
                </h3>
                <p className="text-sm text-slate-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-slate-700 mb-8 leading-relaxed">
              Are you sure you want to delete this email verification token for <strong className="text-purple-600">{verificationToDelete.User.name}</strong>? This will permanently remove the verification token.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={closeDeleteDialog}
                className="bg-white border-slate-300 hover:bg-slate-50 transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(verificationToDelete.id)}
                className="bg-red-600 hover:bg-red-700 transition-all duration-300 hover:scale-105"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Verification
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmailVerificationDashboard
