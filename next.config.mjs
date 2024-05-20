/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s7gfe9hvvkoilgkc.public.blob.vercel-storage.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
