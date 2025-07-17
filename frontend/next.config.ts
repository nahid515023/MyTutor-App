import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

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
    ],
    // Add image optimization settings
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
  },
  // Memory optimization
  experimental: {
    optimizePackageImports: ['react-icons', 'lodash'],
  },
  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    rules: {
      '*.svg': ['@svgr/webpack'],
    },
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

export default withBundleAnalyzer(nextConfig)