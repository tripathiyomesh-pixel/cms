/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol:'https', hostname:'res.cloudinary.com' },
      { protocol:'https', hostname:'images.unsplash.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://backend:4000/api',
    NEXT_PUBLIC_WHATSAPP: process.env.NEXT_PUBLIC_WHATSAPP || '',
    NEXT_PUBLIC_STORE_NAME: process.env.NEXT_PUBLIC_STORE_NAME || 'Jewellery Store',
  },
};
module.exports = nextConfig;
