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
      COMPLETED: { color: 'bg-green-100 text-green-800 border-green-200', icon: Check },
      PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
      FAILED: { color: 'bg-red-100 text-red-800 border-red-200', icon: X },
      CANCELLED: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: X }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border inline-flex items-center gap-1 font-medium`}>
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
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Receipt className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
                <p className="text-gray-600 mt-1">
                  Track all your {user?.role === 'TEACHER' ? 'earnings' : 'payments'} and transaction details
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
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

          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
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

          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
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
        <Card className="shadow-lg border-0 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by transaction ID, subject, or person..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 h-12 border-2 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="lg:w-64">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-12 border-2 focus:border-blue-500">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={refetchPayments} 
                disabled={loading}
                className="h-12 px-6 bg-blue-600 hover:bg-blue-700"
              >
                <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details Table */}
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-gray-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Payment Transactions
              </CardTitle>
              <Badge variant="secondary" className="text-sm font-medium">
                {filteredPayments.length} transactions
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700">Loading payment history...</p>
                  <p className="text-gray-500">Please wait while we fetch your data</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-16 text-red-600">
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
                  <div className="p-4 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <CreditCard className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No payments found</h3>
                  <p className="text-gray-500 mb-6">
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
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-semibold">Transaction Details</TableHead>
                      <TableHead className="font-semibold">{user?.role === 'TEACHER' ? 'Student' : 'Teacher'}</TableHead>
                      <TableHead className="font-semibold">Subject & Class</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Date & Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <p className="font-mono text-sm font-medium text-gray-900">
                              {payment.transactionId.substring(0, 12)}...
                            </p>
                            <div className="flex items-center gap-1">
                              <CreditCard className="w-3 h-3 text-gray-400" />
                              <p className="text-xs text-gray-500">{payment.paymentMethod}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              {user?.role === 'TEACHER' ? (
                                <User className="w-5 h-5 text-white" />
                              ) : (
                                <GraduationCap className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-gray-900">
                                {user?.role === 'TEACHER' ? payment.User.name : payment.Teacher.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {user?.role === 'TEACHER' ? payment.User.email : payment.Teacher.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <p className="font-medium text-sm text-gray-900">{payment.Post.subject}</p>
                            <p className="text-xs text-gray-500">
                              Class {payment.Post.Class} • {payment.Post.medium}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="text-lg font-bold text-gray-900">{formatAmount(payment.amount)}</p>
                        </TableCell>
                        <TableCell className="py-4">
                          {getStatusBadge(payment.status)}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
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
