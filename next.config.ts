import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'content-provider.payshia.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  allowedDevOrigins: [
    "https://6000-firebase-studio-1750702191789.cluster-bg6uurscprhn6qxr6xwtrhvkf6.cloudworkstations.dev",
  ],
};

export default nextConfig;
