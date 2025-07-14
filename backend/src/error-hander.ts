import { NextFunction, Request, Response } from 'express'
import { ErrorCode, HttpException } from './exceptions/root'
import { InternalExcepton } from './exceptions/internal-exception'
import { ZodError } from 'zod'
import { BadRequestException } from './exceptions/bad-request'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export const errorHandler = (method: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await method(req, res, next)
    } catch (error: any) {
      let exception: HttpException
      if (error instanceof HttpException) {
        exception = error
      } else {
        if (error instanceof ZodError) {
          exception = new BadRequestException(
            'Email or password wrong!',
            ErrorCode.UNPROCESSABLE_ENTITY
          )
        } else if (error instanceof PrismaClientKnownRequestError) {
          // Handle specific Prisma errors
          let message = 'Database error occurred'
          if (error.code === 'P2002') {
            message = 'A record with this data already exists'
          } else if (error.code === 'P2021') {
            message = 'The table does not exist in the current database'
          } else if (error.code === 'P2025') {
            message = 'Record not found'
          }
          
          exception = new InternalExcepton(
            message,
            error,
            ErrorCode.INTERNA_EXCEPTION
          )
        } else {
          exception = new InternalExcepton(
            'Something went wrong!',
            error,
            ErrorCode.INTERNA_EXCEPTION
          )
        }
      }
      next(exception)
    }
  }
}