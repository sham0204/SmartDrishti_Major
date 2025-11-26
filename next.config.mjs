/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable image optimization
  images: {
    domains: ['localhost'], // Add your production domains here
  },
  
  // Enable compression
  compress: true,
  
  // Optimize fonts
  experimental: {
    optimizeCss: true,
    optimizeFonts: true,
  },
  
  // Remove default webpack optimizations that might conflict
  webpack: (config, { dev, isServer }) => {
    // Add your webpack customizations here if needed
    return config;
  },
};

export default nextConfig;