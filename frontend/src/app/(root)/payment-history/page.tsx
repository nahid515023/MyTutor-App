'use client'

import { useState, useEffect } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Search,
  CreditCard,
  Loader2,
  Check,
  AlertTriangle,
  X,
  Clock,
  User,
  GraduationCap,
  CalendarDays,
  Receipt,
  DollarSign,
  FileText
} from 'lucide-react'
import { api } from '@/_lib/api'
import { useAuth } from '@/context/AuthProvider'
import { useRouter } from 'next/navigation'


// Payment interface based on your backend structure
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
    profileImage?: string
  }
  Teacher: {
    id: string
    name: string
    email: string
    profileImage?: string
  }
  Post: {
    id: string
    subject: string
    Class: string
    medium: string
    description: string
  }
}

interface PaymentHistoryResponse {
  success: boolean
  data: Payment[]
}

export default function PaymentHistoryPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)
        
        const response = await api.get<PaymentHistoryResponse>(`/payment/history/${user.id}?role=${user.role}`)
        
        if (response.data.success) {
          setPayments(response.data.data)
        } else {
          setError('Failed to fetch payment history')
        }
      } catch (error) {
        console.error('Error fetching payment history:', error)
        setError('Failed to fetch payment history')
      } finally {
        setLoading(false)
      }
    }

    if (!isAuthenticated) {
      router.push('/home')
      return
    }

    if (user) {
      fetchPaymentHistory()
    }
  }, [isAuthenticated, user, router])

  const refetchPayments = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get<PaymentHistoryResponse>(`/payment/history/${user.id}?role=${user.role}`)
      
      if (response.data.success) {
        setPayments(response.data.data)
      } else {
        setError('Failed to fetch payment history')
      }
    } catch (error) {
      console.error('Error fetching payment history:', error)
      setError('Failed to fetch payment history')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      COMPLETED: { 
        color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700', 
        icon: Check 
      },
      PENDING: { 
        color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700', 
        icon: Clock 
      },
      FAILED: { 
        color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700', 
        icon: X 
      },
      CANCELLED: { 
        color: 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600', 
        icon: X 
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border inline-flex items-center gap-1 font-medium transition-colors duration-200`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT'
    }).format(amount)
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.Post?.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user?.role === 'TEACHER' ? payment.User.name : payment.Teacher.name)
        .toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalAmount = filteredPayments.reduce((sum, payment) => {
    return payment.status === 'COMPLETED' ? sum + payment.amount : sum
  }, 0)

  const completedPayments = filteredPayments.filter(p => p.status === 'COMPLETED').length

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors duration-200">
                <Receipt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Payment History</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1 transition-colors duration-200">
                  Track all your {user?.role === 'TEACHER' ? 'earnings' : 'payments'} and transaction details
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 opacity-90">
                <DollarSign className="w-4 h-4" />
                Total {user?.role === 'TEACHER' ? 'Earnings' : 'Spent'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatAmount(totalAmount)}</div>
              <p className="text-sm opacity-80 mt-1">
                From {completedPayments} completed transactions
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 opacity-90">
                <Check className="w-4 h-4" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {filteredPayments.length > 0 ? Math.round((completedPayments / filteredPayments.length) * 100) : 0}%
              </div>
              <p className="text-sm opacity-80 mt-1">
                {completedPayments} of {filteredPayments.length} payments
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 opacity-90">
                <CreditCard className="w-4 h-4" />
                Payment Gateway
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">SSLCommerz</div>
              <p className="text-sm opacity-80 mt-1">
                Secure payment processing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-lg mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <Input
                    placeholder="Search by transaction ID, subject, or person..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 h-12 border-2 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 border-gray-300 dark:border-gray-600 transition-colors duration-200"
                  />
                </div>
              </div>
              <div className="lg:w-64">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-12 border-2 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 transition-colors duration-200">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="all" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">All Status</SelectItem>
                    <SelectItem value="COMPLETED" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Completed</SelectItem>
                    <SelectItem value="PENDING" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Pending</SelectItem>
                    <SelectItem value="FAILED" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Failed</SelectItem>
                    <SelectItem value="CANCELLED" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={refetchPayments} 
                disabled={loading}
                className="h-12 px-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50"
              >
                <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details Table */}
        <Card className="shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white transition-colors duration-200">
                <FileText className="w-5 h-5" />
                Payment Transactions
              </CardTitle>
              <Badge variant="secondary" className="text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600">
                {filteredPayments.length} transactions
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading payment history...</p>
                  <p className="text-gray-500 dark:text-gray-400">Please wait while we fetch your data</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-16 text-red-600 dark:text-red-400">
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">{error}</p>
                  <Button onClick={refetchPayments} className="mt-4" variant="outline">
                    Try Again
                  </Button>
                </div>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center border border-gray-200 dark:border-gray-600 transition-colors duration-200">
                    <CreditCard className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No payments found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'No payments match your current filters. Try adjusting your search criteria.'
                      : 'You haven\'t made any payments yet. Your transaction history will appear here once you start using the platform.'
                    }
                  </p>
                  {(searchTerm || statusFilter !== 'all') && (
                    <Button 
                      onClick={() => {
                        setSearchTerm('')
                        setStatusFilter('all')
                      }}
                      variant="outline"
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50/70 dark:hover:bg-gray-900/70 transition-colors duration-200">
                      <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Transaction Details</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-gray-100">{user?.role === 'TEACHER' ? 'Student' : 'Teacher'}</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Subject & Class</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Amount</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Date & Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200 border-b border-gray-200 dark:border-gray-700">
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <p className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                              {payment.transactionId.substring(0, 12)}...
                            </p>
                            <div className="flex items-center gap-1">
                              <CreditCard className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                              <p className="text-xs text-gray-500 dark:text-gray-400">{payment.paymentMethod}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-full flex items-center justify-center shadow-md">
                              {user?.role === 'TEACHER' ? (
                                <User className="w-5 h-5 text-white" />
                              ) : (
                                <GraduationCap className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                {user?.role === 'TEACHER' ? payment.User.name : payment.Teacher.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {user?.role === 'TEACHER' ? payment.User.email : payment.Teacher.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{payment.Post.subject}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Class {payment.Post.Class} • {payment.Post.medium}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatAmount(payment.amount)}</p>
                        </TableCell>
                        <TableCell className="py-4">
                          {getStatusBadge(payment.status)}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <CalendarDays className="w-4 h-4" />
                            <span>{formatDate(payment.createdAt)}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
