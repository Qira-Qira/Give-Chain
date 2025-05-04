const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Jika menggunakan src directory
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  distDir: '.next',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src'),
      '@components': path.join(__dirname, 'src/components'),
      '@services': path.join(__dirname, 'src/services'),
      '@styles': path.join(__dirname, 'src/styles'),
    }
    return config
  }
}

module.exports = nextConfig
