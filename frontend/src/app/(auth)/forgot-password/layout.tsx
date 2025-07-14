import type { Metadata } from 'next'

import '../../../styles/Auth.css'
import { pageMetadata } from '@/app/metadata'

export const metadata: Metadata = pageMetadata.forgotPassword

export default function ForgotPasswordLayout ({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body>
        {children}
      </body>
    </html>
  )
}
