/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3001',
    WS_URL: process.env.WS_URL || 'http://localhost:3001',
  },
  images: {
    domains: ['localhost'],
  },
  webpack: (config, { isServer }) => {
    // Exclude MongoDB from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        dns: false,
        child_process: false,
        tls: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig