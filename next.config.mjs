/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "@resvg/resvg-js",
      "satori",
      "sharp",
      "fluent-ffmpeg",
      "archiver",
    ],
  },
};

export default nextConfig;
