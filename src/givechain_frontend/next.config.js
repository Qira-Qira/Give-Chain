/** next.config.js **/
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',      // ← turns on static‑export mode
  trailingSlash: true,   // ← optional, but helps routing on static hosts
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
