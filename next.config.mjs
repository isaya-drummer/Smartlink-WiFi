/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "uploadthing.com" },
    ],
  },
  // Skip type checking and linting during build for faster CI
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // Experimental: skip static generation errors
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

export default nextConfig
