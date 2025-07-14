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
  Search,
  DollarSign,
  CreditCard,
  Loader2,
  Check,
  AlertTriangle,
  RefreshCw,
  Clock,
  X,
  Filter,
  Trash2,
  Activity,
  TrendingUp,
  User,
  GraduationCap,
  BookOpen
} from 'lucide-react'
import { api } from '@/_lib/api'

// Enhanced interfaces with better typing
interface Payment {
  id: string
  userId: string
  postId: string
  teacherId: string
  transactionId: string
  paymentMethod: string
  amount: number
  status: string
  createdAt: string
  updatedAt: string
  User: {
    id: string
    name: string
    email: string
  }
  Teacher: {
    id: string
    name: string
    email: string
  }
  Post: {
    id: string
    subject: string
    Class: string
    medium: string
    description: string
  }
}

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface LoadingStates {
  fetchingPayments: boolean
  updatingPayment: string | null
  deletingPayment: string | null
}

export default function PaymentPage () {
  // Enhanced state management
  const [payments, setPayments] = useState<Payment[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [methodFilter, setMethodFilter] = useState<string>('')
  const [amountRangeFilter, setAmountRangeFilter] = useState<string>('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    fetchingPayments: true,
    updatingPayment: null,
    deletingPayment: null
  })

  // Memoized filtered payments to prevent unnecessary recalculations
  const filteredPayments = useMemo(() => {
    let result = [...payments]

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      result = result.filter(
        payment =>
          payment.transactionId.toLowerCase().includes(searchLower) ||
          payment.User.name.toLowerCase().includes(searchLower) ||
          payment.Teacher.name.toLowerCase().includes(searchLower) ||
          payment.Post.subject.toLowerCase().includes(searchLower) ||
          payment.User.email.toLowerCase().includes(searchLower) ||
          payment.Teacher.email.toLowerCase().includes(searchLower)
      )
    }

    if (statusFilter) {
      result = result.filter(payment => payment.status === statusFilter)
    }

    if (methodFilter) {
      result = result.filter(payment => payment.paymentMethod === methodFilter)
    }

    if (amountRangeFilter) {
      const [min, max] = amountRangeFilter.split('-').map(Number)
      result = result.filter(payment => {
        if (max) {
          return payment.amount >= min && payment.amount <= max
        }
        return payment.amount >= min
      })
    }

    return result
  }, [payments, searchTerm, statusFilter, methodFilter, amountRangeFilter])

  // Enhanced toast management
  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = Date.now().toString()
      const newToast: Toast = { id, message, type }

      setToasts(prev => [...prev, newToast])

      // Auto-remove toast after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
      }, 5000)
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Enhanced error handling
  const handleApiError = useCallback(
    (error: unknown, defaultMessage: string) => {
      console.error('API Error:', error)
      const message = error instanceof Error ? error.message : defaultMessage
      showToast(message, 'error')
    },
    [showToast]
  )

  // Payments fetching function
  const fetchPayments = useCallback(async () => {
    try {
      setLoadingStates(prev => ({ ...prev, fetchingPayments: true }))
      const response = await api.get('/dashboard/payments')
      const data = response.data as Payment[]

      // Validate data structure
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from server')
      }

      setPayments(data)
      console.log('Fetched payments:', data)
    } catch (error) {
      handleApiError(error, 'Failed to fetch payments')
    } finally {
      setLoadingStates(prev => ({ ...prev, fetchingPayments: false }))
    }
  }, [handleApiError])

  // Initial data fetching with proper error handling
  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  // Enhanced payment status toggle with optimistic updates
  const togglePaymentStatus = useCallback(
    async (paymentId: string, newStatus: string) => {
      const payment = payments.find(p => p.id === paymentId)
      if (!payment) return

      try {
        setLoadingStates(prev => ({ ...prev, updatingPayment: paymentId }))

        // Optimistic update
        setPayments(prev =>
          prev.map(p => (p.id === paymentId ? { ...p, status: newStatus } : p))
        )

        await api.put(`/dashboard/payments/${paymentId}`, {
          status: newStatus
        })

        showToast(`Payment status updated to ${newStatus} successfully`)
      } catch (error) {
        // Revert optimistic update on error
        setPayments(prev =>
          prev.map(p =>
            p.id === paymentId ? { ...p, status: payment.status } : p
          )
        )
        handleApiError(error, 'Failed to update payment status')
      } finally {
        setLoadingStates(prev => ({ ...prev, updatingPayment: null }))
      }
    },
    [payments, handleApiError, showToast]
  )

  // Enhanced delete functionality with confirmation
  const deletePayment = useCallback(
    async (paymentId: string) => {
      try {
        setLoadingStates(prev => ({ ...prev, deletingPayment: paymentId }))

        await api.delete(`/dashboard/payments/${paymentId}`)

        setPayments(prev => prev.filter(payment => payment.id !== paymentId))
        showToast('Payment deleted successfully')
        setIsDeleteDialogOpen(false)
        setPaymentToDelete(null)
      } catch (error) {
        handleApiError(error, 'Failed to delete payment')
      } finally {
        setLoadingStates(prev => ({ ...prev, deletingPayment: null }))
      }
    },
    [handleApiError, showToast]
  )

  // Dialog helpers
  const openDeleteDialog = useCallback((payment: Payment) => {
    setPaymentToDelete(payment)
    setIsDeleteDialogOpen(true)
  }, [])

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false)
    setPaymentToDelete(null)
  }, [])

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setStatusFilter('')
    setMethodFilter('')
    setAmountRangeFilter('')
  }, [])

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
        return <Check className='h-5 w-5 text-white drop-shadow-sm' />
      case 'error':
        return <AlertTriangle className='h-5 w-5 text-white drop-shadow-sm' />
      case 'info':
        return <Search className='h-5 w-5 text-white drop-shadow-sm' />
      default:
        return <Check className='h-5 w-5 text-white drop-shadow-sm' />
    }
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT'
    }).format(amount)
  }

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalAmount = filteredPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    )
    const completedPayments = filteredPayments.filter(
      p => p.status === 'COMPLETED'
    )
    const pendingPayments = filteredPayments.filter(p => p.status === 'PENDING')
    const failedPayments = filteredPayments.filter(p => p.status === 'FAILED')

    return {
      total: totalAmount,
      completed: completedPayments.length,
      pending: pendingPayments.length,
      failed: failedPayments.length,
      completedAmount: completedPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      )
    }
  }, [filteredPayments])

  // Individual stats for easy access
  const completedPayments = summaryStats.completed
  const pendingPayments = summaryStats.pending

  // Show loading state during initial fetch
  if (loadingStates.fetchingPayments) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='p-8 bg-white rounded-2xl shadow-xl border border-blue-300'>
            <Loader2 className='h-16 w-16 animate-spin mx-auto mb-6 text-blue-600' />
            <p className='text-slate-600 text-xl font-medium'>
              Loading payments...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='p-6 lg:p-8'>
        {/* Enhanced Header with Interactive Elements */}
        <header className='mb-8 bg-white p-8 rounded-2xl shadow-lg border border-blue-300'>
          <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6'>
            <div className='flex-1'>
              <div className='flex items-center gap-4 mb-4'>
                <div className='p-3 bg-blue-600 rounded-2xl shadow-lg'>
                  <DollarSign className='h-8 w-8 text-white' />
                </div>
                <div>
                  <h1 className='text-4xl lg:text-6xl font-bold text-blue-700'>
                    Payment Management
                  </h1>
                  <div className='flex items-center gap-2 mt-2'>
                    <div className='h-2 w-2 bg-emerald-600 rounded-full animate-pulse'></div>
                    <span className='text-sm text-emerald-700 font-medium'>
                      System Online
                    </span>
                  </div>
                </div>
              </div>
              <p className='text-slate-600 text-lg lg:text-xl max-w-2xl'>
                Manage all payments and transactions on the platform (
                {payments.length} total payments)
              </p>
            </div>
            <div className='flex gap-3'>
              <Button
                onClick={clearFilters}
                variant='outline'
                className='flex items-center gap-2 hover:shadow-lg transition-all duration-300 bg-white border-blue-300 text-blue-700 hover:bg-blue-50'
              >
                <Filter className='h-5 w-5' />
                Clear Filters
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant='outline'
                className='flex items-center gap-2 bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-700 hover:-translate-y-1'
              >
                <RefreshCw className='h-5 w-5' />
                Refresh Data
              </Button>
            </div>
          </div>
        </header>

        {/* Enhanced Summary Cards */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8'>
          <Card className='group hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 border border-blue-300 rounded-2xl'>
            <CardContent className='p-8'>
              <div className='flex items-center justify-between mb-4'>
                <div className='p-4 rounded-2xl bg-blue-50 group-hover:scale-105 transition-all duration-300 shadow-md'>
                  <DollarSign className='h-8 w-8 text-blue-600' />
                </div>
                <div className='text-right'>
                  <div className='h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg'>
                    <TrendingUp className='h-4 w-4 text-white' />
                  </div>
                </div>
              </div>
              <div className='space-y-2'>
                <p className='text-sm font-bold text-slate-600 uppercase tracking-wider'>
                  Total Payments
                </p>
                <h3 className='text-4xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300'>
                  {payments.length}
                </h3>
                <p className='text-sm font-semibold text-blue-600 flex items-center gap-1'>
                  <TrendingUp className='h-3 w-3' />
                  All platform payments
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className='group hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 border border-emerald-300 rounded-2xl'>
            <CardContent className='p-8'>
              <div className='flex items-center justify-between mb-4'>
                <div className='p-4 rounded-2xl bg-emerald-50 group-hover:scale-105 transition-all duration-300 shadow-md'>
                  <Check className='h-8 w-8 text-emerald-600' />
                </div>
                <div className='text-right'>
                  <div className='h-8 w-8 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg'>
                    <Check className='h-4 w-4 text-white' />
                  </div>
                </div>
              </div>
              <div className='space-y-2'>
                <p className='text-sm font-bold text-slate-600 uppercase tracking-wider'>
                  Completed
                </p>
                <h3 className='text-4xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300'>
                  {completedPayments}
                </h3>
                <p className='text-sm font-semibold text-emerald-600 flex items-center gap-1'>
                  <Check className='h-3 w-3' />
                  Successfully processed
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className='group hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 border border-orange-300 rounded-2xl'>
            <CardContent className='p-8'>
              <div className='flex items-center justify-between mb-4'>
                <div className='p-4 rounded-2xl bg-orange-50 group-hover:scale-105 transition-all duration-300 shadow-md'>
                  <Clock className='h-8 w-8 text-orange-600' />
                </div>
                <div className='text-right'>
                  <div className='h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center shadow-lg'>
                    <Clock className='h-4 w-4 text-white' />
                  </div>
                </div>
              </div>
              <div className='space-y-2'>
                <p className='text-sm font-bold text-slate-600 uppercase tracking-wider'>
                  Pending
                </p>
                <h3 className='text-4xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300'>
                  {pendingPayments}
                </h3>
                <p className='text-sm font-semibold text-orange-600 flex items-center gap-1'>
                  <Clock className='h-3 w-3' />
                  Awaiting processing
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Table Card */}
        <Card className='group shadow-xl border border-blue-300 bg-white hover:-translate-y-1 transition-all duration-300 rounded-2xl'>
          <CardHeader className='border-b border-slate-200 pb-6'>
            <CardTitle className='text-xl font-bold text-slate-800'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <div className='p-3 rounded-2xl bg-blue-600 mr-3 shadow-lg'>
                    <DollarSign className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <h3 className='text-lg font-bold'>All Payments</h3>
                    <p className='text-sm text-slate-600'>
                      {filteredPayments.length !== payments.length
                        ? `${filteredPayments.length} filtered from ${payments.length} total`
                        : `${payments.length} total payments`}
                    </p>
                  </div>
                </div>
                <Badge className='bg-blue-50 text-blue-700 border-blue-300'>
                  <Activity className='h-3 w-3 mr-1' />
                  Live Data
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className='p-8'>
            {/* Enhanced Filter Section */}
            <Card className='shadow-lg border border-indigo-300 bg-white rounded-2xl mb-6'>
              <CardContent className='p-6'>
                <h3 className='text-lg font-bold text-slate-800 mb-2'>
                  Filter Payments
                </h3>
                <p className='text-slate-600 text-sm mb-6'>
                  Use the filters below to find specific payments
                </p>

                <div className='flex gap-4 flex-wrap'>
                  <div className='relative max-w-xs'>
                    <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-500' />
                    <Input
                      className='pl-8 max-w-xs bg-white border-slate-300 focus:border-blue-500 transition-all duration-300'
                      placeholder='Search by transaction ID, user, subject...'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      aria-label='Search payments'
                    />
                  </div>

                  <select
                    className='h-10 rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 transition-all duration-300'
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    aria-label='Filter by status'
                  >
                    <option value=''>All Status</option>
                    <option value='PENDING'>Pending</option>
                    <option value='COMPLETED'>Completed</option>
                    <option value='FAILED'>Failed</option>
                    <option value='CANCELLED'>Cancelled</option>
                  </select>

                  <select
                    className='h-10 rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 transition-all duration-300'
                    value={methodFilter}
                    onChange={e => setMethodFilter(e.target.value)}
                    aria-label='Filter by payment method'
                  >
                    <option value=''>All Methods</option>
                    <option value='sslcommerz'>SSLCommerz</option>
                    <option value='bkash'>bKash</option>
                    <option value='nagad'>Nagad</option>
                    <option value='rocket'>Rocket</option>
                  </select>

                  <select
                    className='h-10 rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 transition-all duration-300'
                    value={amountRangeFilter}
                    onChange={e => setAmountRangeFilter(e.target.value)}
                    aria-label='Filter by amount range'
                  >
                    <option value=''>All Amounts</option>
                    <option value='0-500'>৳0 - ৳500</option>
                    <option value='500-1000'>৳500 - ৳1000</option>
                    <option value='1000-2000'>৳1000 - ৳2000</option>
                    <option value='2000-5000'>৳2000 - ৳5000</option>
                    <option value='5000'>৳5000+</option>
                  </select>

                  {(searchTerm ||
                    statusFilter ||
                    methodFilter ||
                    amountRangeFilter) && (
                    <Button
                      variant='outline'
                      onClick={clearFilters}
                      className='text-slate-600 bg-white border-slate-300 hover:bg-slate-50 transition-all duration-300'
                    >
                      <Filter className='h-4 w-4 mr-2' />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Table Content */}
            {filteredPayments.length > 0 ? (
              <div className='overflow-x-auto rounded-2xl shadow-lg'>
                <Table className='relative'>
                  <TableHeader className='bg-slate-50 border-b border-slate-200'>
                    <TableRow className='hover:bg-slate-100 transition-all duration-300'>
                      <TableHead className='font-bold text-slate-800 py-4 px-6'>
                        <div className='flex items-center gap-2'>
                          <CreditCard className='h-4 w-4 text-slate-600' />
                          Transaction ID
                        </div>
                      </TableHead>
                      <TableHead className='font-bold text-slate-800 py-4 px-6'>
                        <div className='flex items-center gap-2'>
                          <User className='h-4 w-4 text-slate-600' />
                          Student
                        </div>
                      </TableHead>
                      <TableHead className='font-bold text-slate-800 py-4 px-6'>
                        <div className='flex items-center gap-2'>
                          <GraduationCap className='h-4 w-4 text-slate-600' />
                          Teacher
                        </div>
                      </TableHead>
                      <TableHead className='font-bold text-slate-800 py-4 px-6'>
                        <div className='flex items-center gap-2'>
                          <BookOpen className='h-4 w-4 text-slate-600' />
                          Subject
                        </div>
                      </TableHead>
                      <TableHead className='font-bold text-slate-800 py-4 px-6'>
                        <div className='flex items-center gap-2'>
                          <DollarSign className='h-4 w-4 text-slate-600' />
                          Amount
                        </div>
                      </TableHead>
                      <TableHead className='font-bold text-slate-800 py-4 px-6'>
                        <div className='flex items-center gap-2'>
                          <CreditCard className='h-4 w-4 text-slate-600' />
                          Method
                        </div>
                      </TableHead>
                      <TableHead className='font-bold text-slate-800 py-4 px-6'>
                        <div className='flex items-center gap-2'>
                          <AlertTriangle className='h-4 w-4 text-slate-600' />
                          Status
                        </div>
                      </TableHead>
                      <TableHead className='font-bold text-slate-800 py-4 px-6'>
                        <div className='flex items-center gap-2'>
                          <Clock className='h-4 w-4 text-slate-600' />
                          Date
                        </div>
                      </TableHead>
                      <TableHead className='font-bold text-slate-800 py-4 px-6 text-right'>
                        <div className='flex items-center justify-end gap-2'>
                          <Activity className='h-4 w-4 text-slate-600' />
                          Actions
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className='bg-white'>
                    {filteredPayments.map((payment, index) => (
                      <TableRow
                        key={payment.id}
                        className='hover:bg-blue-50 transition-all duration-300 hover:shadow-md border-b border-slate-100 group'
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animation: 'fadeInUp 0.5s ease-out forwards'
                        }}
                      >
                        <TableCell className='py-6 px-6'>
                          <div className='flex items-center gap-3'>
                            <div className='p-2 bg-blue-600 rounded-xl shadow-md'>
                              <CreditCard className='h-4 w-4 text-white' />
                            </div>
                            <div className='font-mono text-sm font-medium text-slate-800'>
                              {payment.transactionId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='py-6 px-6'>
                          <div className='flex items-center gap-4'>
                            <div className='relative'>
                              <div className='p-3 bg-purple-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300'>
                                <User className='h-5 w-5 text-white' />
                              </div>
                              <div className='absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm'></div>
                            </div>
                            <div className='space-y-1'>
                              <div className='font-semibold text-slate-900 text-lg'>
                                {payment.User.name}
                              </div>
                              <div className='text-sm text-slate-600'>
                                {payment.User.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='py-6 px-6'>
                          <div className='flex items-center gap-4'>
                            <div className='relative'>
                              <div className='p-3 bg-blue-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300'>
                                <GraduationCap className='h-5 w-5 text-white' />
                              </div>
                              <div className='absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-sm'></div>
                            </div>
                            <div className='space-y-1'>
                              <div className='font-semibold text-slate-900 text-lg'>
                                {payment.Teacher.name}
                              </div>
                              <div className='text-sm text-slate-600'>
                                {payment.Teacher.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='py-6 px-6'>
                          <div className='space-y-2'>
                            <div className='font-semibold text-slate-800 text-lg'>
                              {payment.Post.subject}
                            </div>
                            <div className='flex items-center gap-2'>
                              <Badge className='bg-blue-600 text-white border-0 shadow-md'>
                                <BookOpen className='h-3 w-3 mr-1' />
                                Class {payment.Post.Class}
                              </Badge>
                              <Badge className='bg-purple-600 text-white border-0 shadow-md'>
                                <BookOpen className='h-3 w-3 mr-1' />
                                {payment.Post.medium}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='py-6 px-6'>
                          <div className='flex items-center gap-3'>
                            <div className='p-2 bg-purple-600 rounded-xl shadow-md'>
                              <span className='h-4 w-4 text-white font-bold text-lg leading-none'>
                                ৳
                              </span>
                            </div>
                            <div>
                              <div className='font-semibold text-slate-800 text-xl'>
                                {formatCurrency(payment.amount)}
                              </div>
                              <div className='text-sm text-slate-500'>
                                Payment Amount
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='py-6 px-6'>
                          <Badge className='bg-blue-600 text-white border-0 shadow-md'>
                            <CreditCard className='h-3 w-3 mr-1' />
                            {payment.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell className='py-6 px-6'>
                          <Badge
                            className={`shadow-md border-0 text-white ${
                              payment.status === 'COMPLETED'
                                ? 'bg-emerald-600'
                                : payment.status === 'PENDING'
                                ? 'bg-orange-600'
                                : payment.status === 'FAILED'
                                ? 'bg-red-600'
                                : 'bg-slate-600'
                            }`}
                          >
                            {payment.status === 'COMPLETED' ? (
                              <Check className='h-3 w-3 mr-1' />
                            ) : payment.status === 'PENDING' ? (
                              <Clock className='h-3 w-3 mr-1' />
                            ) : (
                              <AlertTriangle className='h-3 w-3 mr-1' />
                            )}
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className='py-6 px-6'>
                          <div className='space-y-1'>
                            <div className='text-sm font-medium text-slate-800'>
                              {formatDate(payment.createdAt)}
                            </div>
                            <div className='text-xs text-slate-500'>
                              Payment Date
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='py-6 px-6'>
                          <div className='flex gap-2 justify-end'>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => openDeleteDialog(payment)}
                              disabled={
                                loadingStates.deletingPayment === payment.id
                              }
                              className='text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 transition-all duration-300 hover:scale-105 hover:shadow-md bg-white'
                            >
                              {loadingStates.deletingPayment === payment.id ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                              ) : (
                                'Delete'
                              )}
                            </Button>
                            {payment.status === 'PENDING' && (
                              <>
                                <Button
                                  size='sm'
                                  className='bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-md'
                                  onClick={() =>
                                    togglePaymentStatus(payment.id, 'COMPLETED')
                                  }
                                  disabled={
                                    loadingStates.updatingPayment === payment.id
                                  }
                                >
                                  {loadingStates.updatingPayment ===
                                  payment.id ? (
                                    <Loader2 className='h-4 w-4 animate-spin' />
                                  ) : (
                                    'Complete'
                                  )}
                                </Button>
                                <Button
                                  size='sm'
                                  className='bg-red-600 hover:bg-red-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-md'
                                  onClick={() =>
                                    togglePaymentStatus(payment.id, 'FAILED')
                                  }
                                  disabled={
                                    loadingStates.updatingPayment === payment.id
                                  }
                                >
                                  {loadingStates.updatingPayment ===
                                  payment.id ? (
                                    <Loader2 className='h-4 w-4 animate-spin' />
                                  ) : (
                                    'Fail'
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className='py-16 text-center'>
                <div className='mb-8'>
                  <div className='p-6 bg-blue-600 rounded-3xl shadow-2xl mx-auto w-fit'>
                    <CreditCard className='h-16 w-16 text-white' />
                  </div>
                </div>
                <h3 className='text-2xl font-bold text-slate-800 mb-3'>
                  No payments found
                </h3>
                <p className='text-slate-600 text-lg max-w-md mx-auto mb-6'>
                  {searchTerm ||
                  statusFilter ||
                  methodFilter ||
                  amountRangeFilter
                    ? 'No payments match your current search criteria'
                    : 'No payments available to display'}
                </p>
                {(searchTerm ||
                  statusFilter ||
                  methodFilter ||
                  amountRangeFilter) && (
                  <Button
                    variant='outline'
                    onClick={clearFilters}
                    className='bg-white border-slate-300 hover:bg-slate-50 transition-all duration-300 hover:scale-105'
                  >
                    <Filter className='h-4 w-4 mr-2' />
                    Clear all filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Toast Notifications */}
      <div className='fixed top-6 right-6 z-50 space-y-3 max-w-sm'>
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className={`group relative p-5 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/20 transform transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-3xl ${getToastStyles(
              toast.type
            )}`}
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
            role='alert'
            aria-live='polite'
          >
            <div className='absolute inset-0 rounded-2xl bg-white/10 opacity-50 group-hover:opacity-70 transition-opacity duration-300'></div>

            <div className='absolute top-2 right-2 w-2 h-2 bg-white/30 rounded-full animate-pulse'></div>
            <div className='absolute bottom-3 left-3 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse delay-700'></div>

            <div className='relative flex items-start justify-between gap-3'>
              <div className='flex items-start gap-3 flex-1'>
                <div className='flex-shrink-0 p-2 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110'>
                  {getToastIcon(toast.type)}
                </div>
                <div className='flex-1 pt-1'>
                  <p className='text-sm font-semibold leading-relaxed text-white drop-shadow-sm'>
                    {toast.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className='flex-shrink-0 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 opacity-70 hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95'
                aria-label='Close notification'
              >
                <X className='h-4 w-4 text-white drop-shadow-sm' />
              </button>
            </div>

            <div className='absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-2xl overflow-hidden'>
              <div
                className='h-full bg-white/40 rounded-b-2xl transition-all duration-[5000ms] ease-linear'
                style={{ width: '0%' }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Delete Confirmation Dialog */}
      {isDeleteDialogOpen && paymentToDelete && (
        <div
          className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'
          onClick={closeDeleteDialog}
          role='dialog'
          aria-modal='true'
          aria-labelledby='delete-dialog-title'
        >
          <div
            className='bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 border border-red-300'
            onClick={e => e.stopPropagation()}
          >
            <div className='flex items-center mb-6'>
              <div className='p-3 bg-red-600 rounded-2xl mr-4 shadow-lg'>
                <AlertTriangle className='h-6 w-6 text-white' />
              </div>
              <div>
                <h3
                  id='delete-dialog-title'
                  className='text-xl font-bold text-slate-900'
                >
                  Delete Payment
                </h3>
                <p className='text-sm text-slate-600'>
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className='text-slate-700 mb-8 leading-relaxed'>
              Are you sure you want to delete the payment for{' '}
              <strong>{formatCurrency(paymentToDelete.amount)}</strong>{' '}
              (Transaction:{' '}
              <strong>{paymentToDelete.transactionId.slice(0, 8)}...</strong>)?
              This will permanently remove the payment record.
            </p>
            <div className='flex justify-end gap-3'>
              <Button
                variant='outline'
                onClick={closeDeleteDialog}
                disabled={loadingStates.deletingPayment === paymentToDelete.id}
                className='bg-white border-slate-300 hover:bg-slate-50 transition-all duration-300'
              >
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={() => deletePayment(paymentToDelete.id)}
                disabled={loadingStates.deletingPayment === paymentToDelete.id}
                className='bg-red-600 hover:bg-red-700 transition-all duration-300 hover:scale-105'
              >
                {loadingStates.deletingPayment === paymentToDelete.id ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className='h-4 w-4 mr-2' />
                    Delete Payment
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
