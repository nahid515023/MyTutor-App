import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: [
      'img.daisyui.com', 
      'images.unsplash.com', 
      'randomuser.me', 
      'localhost',
      'lh3.googleusercontent.com',
      'mytutor-backend.onrender.com'
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mytutor-backend.onrender.com',
        pathname: '/**',
      }
    ]
  },
  // Optimize for production
  poweredByHeader: false,
  compress: true,
  // Enable static optimization
  trailingSlash: false,
  // Environment variables validation
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_URL_IMAGE: process.env.NEXT_PUBLIC_API_URL_IMAGE,
  }
}

export default nextConfig