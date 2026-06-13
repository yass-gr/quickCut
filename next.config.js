/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@remotion/renderer"],
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
