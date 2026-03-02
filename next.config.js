/** @type {import('next').NextConfig} */
const nextConfig = {
    // This allows your Expo app to talk to your Next.js server on Fedora
    experimental: {

    },
    // Ensure Next.js only looks in src/app for routes
    useFileSystemPublicRoutes: true,
  };
  
  module.exports = nextConfig;