/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable server actions for file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },

  // Configure image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  // Webpack configuration for canvas and PDF.js
  webpack: (config, { isServer }) => {
    // Handle canvas and PDF processing libraries (server-side only)
    if (isServer) {
      // Mark native modules as external
      config.externals.push('canvas', 'sharp', 'pdfjs-dist')

      // Also externalize any module that imports processor to prevent webpack analysis
      config.externals.push(({ request }, callback) => {
        // Externalize the processor module itself and the process-pdf function
        if (request === '@/lib/flipbook/processor' ||
            request === './lib/flipbook/processor' ||
            request === '@/lib/inngest/functions/process-pdf' ||
            request === './lib/inngest/functions/process-pdf') {
          return callback(null, `commonjs ${request}`)
        }
        callback()
      })
    }

    // Handle PDF.js worker
    config.resolve.alias.canvas = false

    return config
  },
}

export default nextConfig
