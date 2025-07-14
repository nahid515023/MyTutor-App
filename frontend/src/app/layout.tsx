import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ThemeProvider } from '@/context/ThemeProvider'
import { AuthProvider } from '@/context/AuthProvider'
import { Metadata } from 'next'
import { pageMetadata } from '@/app/metadata'

export const metadata: Metadata = pageMetadata.landingPage

import './globals.css'

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className='min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-gray-900 dark:via-slate-800 dark:to-neutral-900 dark:text-white'>
        <ThemeProvider>
          <AuthProvider>
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          {children}
            </GoogleOAuthProvider>
            {/* <AuthDebug /> */}
            <ToastContainer 
          position="top-center"
          autoClose={3000}
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
