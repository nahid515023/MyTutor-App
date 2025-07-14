import { Request, Response, NextFunction } from 'express'
import { PORT, STORE_ID, STORE_PASSWORD } from '../secrets'
import { randomUUID } from 'crypto'
const SSLCommerzPayment = require('sslcommerz-lts')
import { prisma } from '..'

export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId, amount, teacherId, userId } = req.body
    console.log(req.body)

    const store_id = STORE_ID
    const store_passwd = STORE_PASSWORD
    const is_live = false //true for live, false for sandbox
    const port = PORT

    const tran_id = randomUUID() // Generate a unique transaction ID

    const data = {
      total_amount: amount,
      currency: 'BDT',
      tran_id: tran_id, // use unique tran_id for each api call
      success_url: `http://localhost:${port}/api/payment/success/${tran_id}`,
      fail_url: `http://localhost:${port}/api/payment/fail/${tran_id}`,
      cancel_url: `http://localhost:${port}/api/payment/cancel/${tran_id}`,
      ipn_url: `http://localhost:${port}/api/payment/ipn/${tran_id}`,
      shipping_method: 'Courier',
      product_name: 'Computer.',
      product_category: 'Electronic',
      product_profile: 'general',
      cus_name: 'Customer Name',
      cus_email: 'customer@example.com',
      cus_add1: 'Dhaka',
      cus_add2: 'Dhaka',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: '01711111111',
      cus_fax: '01711111111',
      ship_name: 'Customer Name',
      ship_add1: 'Dhaka',
      ship_add2: 'Dhaka',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: 1000,
      ship_country: 'Bangladesh'
    }

    console.log('Initializing payment with data:', data)

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)

    await prisma.payment.create({
      data: {
        postId: postId,
        amount: parseInt(amount),
        userId: userId,
        teacherId: teacherId,
        transactionId: tran_id,
        status: 'PENDING',
        paymentMethod: 'sslcommerz'
      }
    })

    interface ApiResponse {
      GatewayPageURL: string
      [key: string]: any
    }
    sslcz.init(data).then((apiResponse: ApiResponse) => {
      let GatewayPageURL = apiResponse.GatewayPageURL
      res.status(200).json({
        message: 'Payment initialized successfully',
        GatewayPageURL
      })
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    next(error)
  }
}

export const successPayment = async (req: Request, res: Response) => {
  try {
    const { tran_id } = req.params

    if (!tran_id) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is missing'
      })
    }

    // Find and update payment status
    const payment = await prisma.payment.findFirst({
      where: {
        transactionId: tran_id
      }
    })

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      })
    }

    // Update payment status to COMPLETED
    await prisma.payment.update({
      where: {
        id: payment.id
      },
      data: {
        status: 'COMPLETED'
      }
    })

    // Update post to booked status if payment is for a booking
    await prisma.post.update({
      where: {
        id: payment.postId
      },
      data: {
        booked: true
      }
    })

    // Redirect to frontend success page
    res.redirect(
      `http://localhost:3000/create-meeting?status=success&teacherId=${payment.teacherId}&userId=${payment.userId}&postId=${payment.postId}&transactionId=${tran_id}`
    )
  } catch (error) {
    console.error('Error processing successful payment:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to process payment'
    })
  }
}

export const failPayment = async (req: Request, res: Response) => {
  try {
    // Extract transaction ID from the request body
    const { tran_id } = req.params

    if (!tran_id) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is missing'
      })
    }

    // Find and update payment status
    const payment = await prisma.payment.findFirst({
      where: {
        transactionId: tran_id
      }
    })

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      })
    }

    // Update payment status to FAILED
    await prisma.payment.update({
      where: {
        id: payment.id
      },
      data: {
        status: 'FAILED'
      }
    })
    res.redirect(
      `http://localhost:3000/post/${payment.postId}?status=failed&transactionId=${tran_id}`
    )
  } catch (error) {
    console.error('Error processing failed payment:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating payment status'
    })
  }
}

export const cancelPayment = async (req: Request, res: Response) => {
  try {
    // Extract transaction ID from the request body
    const { tran_id } = req.params

    if (!tran_id) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is missing'
      })
    }

    // Find and update payment status
    const payment = await prisma.payment.findFirst({
      where: {
        transactionId: tran_id
      }
    })

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      })
    }

    // Update payment status to CANCELLED
    await prisma.payment.update({
      where: {
        id: payment.id
      },
      data: {
        status: 'CANCELLED'
      }
    })
    res.redirect(
      `http://localhost:3000/post/${payment.postId}?status=cancelled&transactionId=${tran_id}`
    )
  } catch (error) {
    console.error('Error processing cancelled payment:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating payment status'
    })
  }
}

// Add IPN (Instant Payment Notification) handler
export const ipnHandler = async (req: Request, res: Response) => {
  try {
    const payment_data = req.body

    if (payment_data.status === 'VALID') {
      // Find the payment by transaction ID
      const payment = await prisma.payment.findFirst({
        where: {
          transactionId: payment_data.tran_id
        }
      })

      if (payment) {
        // Update payment status
        await prisma.payment.update({
          where: {
            id: payment.id
          },
          data: {
            status: 'COMPLETED'
          }
        })
      }
    }

    res.status(200).send('IPN received')
  } catch (error) {
    console.error('Error in IPN handler:', error)
    res.status(500).send('Error processing IPN')
  }
}

// Get payment history for a user
export const getPaymentHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId
    const role = req.query.role as string

    let payments

    // If role is teacher, get payments where user is teacher
    // Otherwise get payments where user is student
    if (role === 'TEACHER') {
      payments = await prisma.payment.findMany({
        where: {
          teacherId: userId
        },
        include: {
          Post: true,
          User: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true
            }
          },
          Teacher: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      payments = await prisma.payment.findMany({
        where: {
          userId: userId
        },
        include: {
          Post: true,
          User: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true
            }
          },
          Teacher: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    res.status(200).json({
      success: true,
      data: payments
    })
  } catch (error) {
    console.error('Error fetching payment history:', error)
    next(error)
  }
}
