/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["dkc-only-local-dev-bucket.s3.amazonaws.com"],
  },
};

module.exports = nextConfig;
