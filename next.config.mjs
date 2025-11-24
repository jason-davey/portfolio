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

  // Webpack configuration
  webpack: (config) => {
    // No special configuration needed - pdf-lib is pure JavaScript
    return config
  },
}

export default nextConfig
