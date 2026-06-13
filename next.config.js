/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@remotion/renderer", "@remotion/bundler"],
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
