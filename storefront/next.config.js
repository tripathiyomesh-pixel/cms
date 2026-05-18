/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy /api calls to backend internally (Docker network)
  // This way browser always calls same host:port, no CORS or IP issues
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.INTERNAL_API_URL || 'http://backend:4000/api'}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol:'https', hostname:'images.unsplash.com' },
      { protocol:'https', hostname:'res.cloudinary.com' },
      { protocol:'http',  hostname:'localhost' },
      { protocol:'http',  hostname:'backend' },
    ],
  },
};

module.exports = nextConfig;
