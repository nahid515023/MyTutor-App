import { HttpException } from '../exceptions/root'
import { NextFunction, Request, Response } from 'express'

export const errorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default to 500 if statusCode is undefined
  const statusCode = error.statusCode || 500
  
  res.status(statusCode).json({
    message: error.message || 'Internal Server Error',
    errorCode: error.errorCode || 'INTERNAL_ERROR',
    errors: error.errors || []
  })
}