export const generateOTP = (size: number = 4): string => {
  const digits = '123456789'
  let OTP = ''
  const len = digits.length

  for (let i = 0; i < size; i++) {
    OTP += digits[Math.floor(Math.random() * len)]
  }

  return OTP
}
