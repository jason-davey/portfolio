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
      // Mark native modules and heavy dependencies as external
      // Inngest runtime will provide these at execution time
      config.externals.push('canvas', 'sharp', 'pdfjs-dist', 'pdfjs-dist/build/pdf.mjs')
    }

    // Handle PDF.js worker
    config.resolve.alias.canvas = false
    config.resolve.alias['pdfjs-dist'] = false

    return config
  },
}

export default nextConfig
