/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Allow bounded AI generation requests to finish before the proxy times out.
  experimental: { proxyTimeout: 100000 },
  i18n: { locales: ['fa', 'en', 'fr'], defaultLocale: 'fa' },
  // Preserve DRF URL slashes so POST requests do not become redirecting GETs.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: "/:locale(fa|en|fr)/api/:path*",
        // Match Next's internal locale prefix, but keep Django API URLs unprefixed.
        locale: false,
        destination: `${process.env.API_PROXY_URL || "http://localhost:8003"}/api/:path*/`,
      },
    ];
  },
};
module.exports = nextConfig;
