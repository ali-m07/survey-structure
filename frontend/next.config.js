/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Preserve DRF URL slashes so POST requests do not become redirecting GETs.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_PROXY_URL || "http://localhost:8003"}/api/:path*/`,
      },
    ];
  },
};
module.exports = nextConfig;
