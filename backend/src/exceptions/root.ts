export class HttpException extends Error {
  errorCode: ErrorCode
  statusCode: number
  errors: any

  constructor (
    message: string,
    errorCode: ErrorCode,
    statusCode: number,
    errors: any
  ) {
    super(message)
    this.errorCode = errorCode
    this.statusCode = statusCode
    this.errors = errors
  }

}

export enum ErrorCode {
  USER_NOT_FOUND = 1001,
  USER_ALREADY_EXISTS = 1002,
  INCORRECT_PASSWORD = 1003,
  ADDRESS_DOES_NOT_BELONG = 1004,
  PASSWORD_DO_NOT_MATCH =1005,
  EMAIL_ALREADY_IN_USE = 1006,
  INVALID_CREDENTIALS = 1007,
  ACCOUNT_LOCKED = 1008,
  ACCOUNT_SUSPENDED = 1009,
  WEAK_PASSWORD = 1010,
  UNPROCESSABLE_ENTITY = 2001,
  INTERNA_EXCEPTION = 3001,
  UNAUTHORIZED = 4001,
  FORBIDDEN = 4002,
  PRODUCT_NOT_FOUND = 5001,
  ADDRESS_NOT_FOUND = 6001,
  ORDER_NOT_FOUND = 7001,
  INVALID_INPUT = 8001, 
  USER_NOT_VERIFIED = 9001,
  INVALID_VERIFICATION_TOKEN = 9002,
  INVALID_RESET_PASSWORD_TOKEN = 9003,
  INVALID_GOOGLE_TOKEN = 9004,
  POST_NOT_FOUND = 10001,
  ADMIN_ALREADY_EXISTS = 11001,
  ADMIN_CREATION_FORBIDDEN = 11002
}
