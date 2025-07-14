'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Check, 
  Search, 
  AlertTriangle, 
  Loader2, 
  X, 
  Users,
  UserCheck,
  UserX,
  Shield,
  Crown,
  GraduationCap,
  RefreshCw,
  Filter,
  Trash2,
  Mail,
  Activity,
  TrendingUp
} from 'lucide-react'
import { api } from '@/_lib/api'

// Enhanced interfaces with better typing
interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT'
  status: string
}

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface LoadingStates {
  fetchingUsers: boolean
  updatingUser: string | null
  deletingUser: string | null
}

export default function UsersPage() {
  // Enhanced state management
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    fetchingUsers: true,
    updatingUser: null,
    deletingUser: null
  })

  // Memoized filtered users to prevent unnecessary recalculations
  const filteredUsers = useMemo(() => {
    let result = [...users]

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      result = result.filter(
        user =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      )
    }

    if (roleFilter) {
      result = result.filter(
        user => user.role === roleFilter
      )
    }

    if (statusFilter) {
      result = result.filter(
        user => user.status === statusFilter
      )
    }

    return result
  }, [users, searchTerm, roleFilter, statusFilter])

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

  // Enhanced error handling
  const handleApiError = useCallback((error: unknown, defaultMessage: string) => {
    console.error('API Error:', error)
    const message = error instanceof Error ? error.message : defaultMessage
    showToast(message, 'error')
  }, [showToast])

  // Initial data fetching with proper error handling
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingStates(prev => ({ ...prev, fetchingUsers: true }))
        const response = await api.get('/dashboard/users')
        const data = response.data as User[]
        
        // Validate data structure
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from server')
        }
        
        setUsers(data)
        console.log('Fetched users:', data)
      } catch (error) {
        handleApiError(error, 'Failed to fetch users')
        // Set empty array on error to prevent UI issues
        setUsers([])
      } finally {
        setLoadingStates(prev => ({ ...prev, fetchingUsers: false }))
      }
    }

    fetchUsers()
  }, [handleApiError])

  // Fixed toggle user status with proper state management
  const toggleUserStatus = useCallback(async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) {
      showToast('User not found', 'error')
      return
    }

    const newStatus = user.status === 'active' ? 'blocked' : 'active'
    const previousUsers = [...users]

    try {
      setLoadingStates(prev => ({ ...prev, updatingUser: userId }))
      
      // Optimistic update
      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, status: newStatus } : u
        )
      )

      // API call
      await api.put(`/dashboard/users/${userId}`, { status: newStatus })
      
      showToast(
        `User ${user.name} ${newStatus === 'active' ? 'activated' : 'blocked'} successfully`
      )
    } catch (error) {
      // Revert optimistic update on error
      setUsers(previousUsers)
      handleApiError(error, 'Failed to update user status')
    } finally {
      setLoadingStates(prev => ({ ...prev, updatingUser: null }))
    }
  }, [users, showToast, handleApiError])

  // Enhanced delete user with proper error handling
  const deleteUser = useCallback(async () => {
    if (!userToDelete) return

    const previousUsers = [...users]

    try {
      setLoadingStates(prev => ({ ...prev, deletingUser: userToDelete.id }))
      
      // Optimistic update
      setUsers(prev => prev.filter(user => user.id !== userToDelete.id))
      
      await api.delete(`/dashboard/users/${userToDelete.id}`)
      
      showToast(`User ${userToDelete.name} deleted successfully`)
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
    } catch (error) {
      // Revert optimistic update on error
      setUsers(previousUsers)
      handleApiError(error, 'Failed to delete user')
    } finally {
      setLoadingStates(prev => ({ ...prev, deletingUser: null }))
    }
  }, [userToDelete, users, showToast, handleApiError])

  const openDeleteDialog = useCallback((user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }, [])

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false)
    setUserToDelete(null)
  }, [])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setRoleFilter('')
    setStatusFilter('')
  }, [])

  // Enhanced toast styling with solid colors
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
        return <Search className="h-5 w-5 text-white drop-shadow-sm" />
      default:
        return <Check className="h-5 w-5 text-white drop-shadow-sm" />
    }
  }

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const activeUsers = filteredUsers.filter(u => u.status === 'active')
    const blockedUsers = filteredUsers.filter(u => u.status === 'blocked')
    const admins = filteredUsers.filter(u => u.role === 'ADMIN')
    const teachers = filteredUsers.filter(u => u.role === 'TEACHER')
    const students = filteredUsers.filter(u => u.role === 'STUDENT')
    
    return {
      total: filteredUsers.length,
      active: activeUsers.length,
      blocked: blockedUsers.length,
      admins: admins.length,
      teachers: teachers.length,
      students: students.length
    }
  }, [filteredUsers])

  // Show loading state during initial fetch
  if (loadingStates.fetchingUsers) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden">
        <div className="text-center relative z-10">
          <div className="p-8 bg-white rounded-2xl shadow-xl border border-blue-300">
            <Loader2 className="h-16 w-16 animate-spin mx-auto mb-6 text-blue-600" />
            <p className="text-slate-700 text-xl font-medium">Loading users...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <div className="relative z-10 p-6 lg:p-8">
        {/* Enhanced Header with Interactive Elements */}
        <header className="mb-8 bg-white shadow-lg p-8 rounded-2xl border border-blue-300 hover:shadow-xl transition-all duration-300">
          <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-6xl font-bold text-blue-700">
                    User Management
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-2 w-2 bg-emerald-600 rounded-full animate-pulse"></div>
                    <span className="text-sm text-emerald-700 font-medium">System Online</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-700 text-lg lg:text-xl max-w-2xl">
                Manage all users on your tutoring platform ({users.length} total users)
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
          <Card className="group hover:shadow-xl transition-all duration-300 border border-blue-300 bg-white hover:bg-blue-50 hover:-translate-y-1 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-2xl bg-blue-50 group-hover:scale-105 transition-all duration-300 shadow-lg">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="h-8 w-8 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Total Users</p>
                <h3 className="text-4xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300">
                  {summaryStats.total}
                </h3>
                <p className="text-sm font-semibold text-emerald-700 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  All platform users
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border border-emerald-300 bg-white hover:bg-emerald-50 hover:-translate-y-1 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-2xl bg-emerald-50 group-hover:scale-105 transition-all duration-300 shadow-lg">
                  <UserCheck className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="text-right">
                  <div className="h-8 w-8 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Active Users</p>
                <h3 className="text-4xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300">
                  {summaryStats.active}
                </h3>
                <p className="text-sm font-semibold text-emerald-700 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Currently active
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border border-purple-300 bg-white hover:bg-purple-50 hover:-translate-y-1 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-2xl bg-purple-50 group-hover:scale-105 transition-all duration-300 shadow-lg">
                  <GraduationCap className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-right">
                  <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <GraduationCap className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Teachers</p>
                <h3 className="text-4xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300">
                  {summaryStats.teachers}
                </h3>
                <p className="text-sm font-semibold text-purple-700 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Educators
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border border-red-300 bg-white hover:bg-red-50 hover:-translate-y-1 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-2xl bg-red-50 group-hover:scale-105 transition-all duration-300 shadow-lg">
                  <UserX className="h-8 w-8 text-red-600" />
                </div>
                <div className="text-right">
                  <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Blocked Users</p>
                <h3 className="text-4xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300">
                  {summaryStats.blocked}
                </h3>
                <p className="text-sm font-semibold text-red-700 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Restricted access
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Table Card */}
        <Card className="group shadow-xl border border-indigo-300 bg-white hover:bg-indigo-50 transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-300 pb-6">
            <CardTitle className="text-xl font-bold text-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 rounded-2xl bg-indigo-600 mr-3 shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-indigo-700">All Users</h3>
                    <p className="text-sm text-slate-600">
                      {filteredUsers.length !== users.length 
                        ? `${filteredUsers.length} filtered from ${users.length} total` 
                        : `${users.length} total users`}
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
            <Card className="shadow-lg border border-blue-300 bg-white rounded-2xl overflow-hidden mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Filter Users</h3>
                <p className="text-slate-600 text-sm mb-6">Use the filters below to find specific users</p>
                
                <div className="flex gap-4 flex-wrap">
                  <div className="relative max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      className="pl-8 max-w-xs bg-white border-slate-300 focus:border-blue-400 transition-all duration-300"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      aria-label="Search users by name or email"
                    />
                  </div>

                  <select
                    className="h-10 rounded-md border bg-white border-slate-300 px-3 py-2 focus:border-blue-400 transition-all duration-300"
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    aria-label="Filter by role"
                  >
                    <option value="">All Roles</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="STUDENT">Student</option>
                    <option value="ADMIN">Admin</option>
                  </select>

                  <select
                    className="h-10 rounded-md border bg-white border-slate-300 px-3 py-2 focus:border-blue-400 transition-all duration-300"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    aria-label="Filter by status"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>

                  {(searchTerm || roleFilter || statusFilter) && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="text-slate-700 bg-white border-slate-300 hover:bg-slate-50 transition-all duration-300"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            {loadingStates.fetchingUsers ? (
              <div className='flex items-center justify-center h-64'>
                <div className='text-center'>
                  <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className='text-slate-600 font-medium'>Loading users...</p>
                </div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl shadow-lg">
                <Table className="relative">
                  <TableHeader className="bg-slate-50 border-b border-slate-300">
                    <TableRow className="hover:bg-slate-100 transition-all duration-300">
                      <TableHead className="font-bold text-slate-800 py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-600" />
                          User Details
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-slate-800 py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-slate-600" />
                          Role
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-slate-800 py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-slate-600" />
                          Status
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-slate-800 py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Shield className="h-4 w-4 text-slate-600" />
                          Actions
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {filteredUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        className="hover:bg-blue-50 transition-all duration-300 hover:shadow-lg border-b border-slate-200 group"
                      >
                        <TableCell className="py-6 px-6">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                                {user.role === 'ADMIN' ? (
                                  <Crown className="h-5 w-5 text-white" />
                                ) : user.role === 'TEACHER' ? (
                                  <GraduationCap className="h-5 w-5 text-white" />
                                ) : (
                                  <Users className="h-5 w-5 text-white" />
                                )}
                              </div>
                              <div className={`absolute -top-1 -right-1 w-4 h-4 ${user.status === 'active' ? 'bg-emerald-600' : 'bg-red-600'} rounded-full border-2 border-white shadow-sm`}></div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-slate-900 text-lg">{user.name}</div>
                              <div className="text-sm text-slate-600 flex items-center gap-2">
                                <Mail className="h-3 w-3 text-slate-500" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-6">
                          <Badge
                            className={`shadow-lg border text-white ${
                              user.role === 'ADMIN'
                                ? 'bg-purple-600 border-purple-300'
                                : user.role === 'TEACHER'
                                ? 'bg-blue-600 border-blue-300'
                                : 'bg-emerald-600 border-emerald-300'
                            }`}
                          >
                            {user.role === 'ADMIN' && <Crown className="h-3 w-3 mr-1" />}
                            {user.role === 'TEACHER' && <GraduationCap className="h-3 w-3 mr-1" />}
                            {user.role === 'STUDENT' && <Users className="h-3 w-3 mr-1" />}
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-6 px-6">
                          <Badge
                            className={`shadow-lg border text-white ${
                              user.status === 'active'
                                ? 'bg-emerald-600 border-emerald-300'
                                : 'bg-red-600 border-red-300'
                            }`}
                          >
                            {user.status === 'active' ? (
                              <Check className="h-3 w-3 mr-1" />
                            ) : (
                              <X className="h-3 w-3 mr-1" />
                            )}
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-6 px-6">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleUserStatus(user.id)}
                              disabled={loadingStates.updatingUser === user.id}
                              className={`transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white ${
                                user.status === 'active' 
                                  ? 'text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 hover:bg-red-50' 
                                  : 'text-emerald-600 hover:text-emerald-700 border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50'
                              }`}
                              aria-label={`${user.status === 'active' ? 'Block' : 'Activate'} user ${user.name}`}
                            >
                              {loadingStates.updatingUser === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : user.status === 'active' ? (
                                <>
                                  <UserX className="h-4 w-4 mr-1" />
                                  Block
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Activate
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDeleteDialog(user)}
                              disabled={loadingStates.deletingUser === user.id}
                              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white hover:bg-red-50"
                              aria-label={`Delete user ${user.name}`}
                            >
                              {loadingStates.deletingUser === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="mb-8">
                  <div className="p-6 bg-blue-600 rounded-2xl shadow-xl mx-auto w-fit">
                    <Users className="h-16 w-16 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  No users found
                </h3>
                <p className="text-slate-600 text-lg max-w-md mx-auto mb-6">
                  {searchTerm || roleFilter || statusFilter
                    ? 'No users match your current search criteria'
                    : 'No users available to display'}
                </p>
                {(searchTerm || roleFilter || statusFilter) && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="bg-white border-slate-300 hover:bg-slate-50 transition-all duration-300 hover:-translate-y-1"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear all filters
                  </Button>
                )}
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
            className={`group relative p-5 rounded-2xl shadow-xl border transform transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-2xl ${getToastStyles(toast.type)}`}
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
            role="alert"
            aria-live="polite"
          >
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-shrink-0 p-2 rounded-xl bg-white/20 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-105">
                  {getToastIcon(toast.type)}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm font-semibold leading-relaxed text-white">
                    {toast.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 opacity-70 hover:opacity-100 transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Close notification"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Delete Confirmation Dialog */}
      {isDeleteDialogOpen && userToDelete && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closeDeleteDialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div 
            className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4 border border-slate-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-red-600 rounded-2xl mr-4 shadow-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 id="delete-dialog-title" className="text-xl font-bold text-slate-900">
                  Delete User
                </h3>
                <p className="text-sm text-slate-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-slate-700 mb-8 leading-relaxed">
              Are you sure you want to delete <strong>{userToDelete.name}</strong> ({userToDelete.email})? 
              This will permanently remove their account and all associated data.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={closeDeleteDialog}
                disabled={loadingStates.deletingUser === userToDelete.id}
                className="bg-white border-slate-300 hover:bg-slate-50 transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={deleteUser}
                disabled={loadingStates.deletingUser === userToDelete.id}
                className="bg-red-600 hover:bg-red-700 transition-all duration-300 hover:-translate-y-1"
              >
                {loadingStates.deletingUser === userToDelete.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete User
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
