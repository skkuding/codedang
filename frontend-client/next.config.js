/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://dev.codedang.com/api/:path*',
        permanent: true
      }
    ]
  }
}

module.exports = nextConfig
