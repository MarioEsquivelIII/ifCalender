/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true
    },
    // This will be set during build based on repository name
    basePath: process.env.NODE_ENV === 'production' ? process.env.BASE_PATH || '' : '',
    assetPrefix: process.env.NODE_ENV === 'production' ? process.env.BASE_PATH || '' : '',
}

module.exports = nextConfig 