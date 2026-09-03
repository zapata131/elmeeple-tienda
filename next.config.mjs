import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cf.geekdo-images.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 'fichaydado.com' },
      { protocol: 'https', hostname: 'mundomeeplestore.com' },
      { protocol: 'https', hostname: 'rollgames.mx' },
      { protocol: 'https', hostname: 'tdetlacuache.com' },
      { protocol: 'https', hostname: 'quantumboardgames.com' },
      { protocol: 'https', hostname: 'alfaydelta.com' },
      { protocol: 'https', hostname: 'bundaba.com.mx' },
      { protocol: 'https', hostname: 'geekystuff.com.mx' },
    ],
  },
};

export default nextConfig;
