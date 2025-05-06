/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.metmuseum.org',
        port: '',
        pathname: '/CRDImages/**'
      },
    ],
    domains: [
      'images.metmuseum.org'
    ],
    formats: ['image/webp', 'image/avif'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
