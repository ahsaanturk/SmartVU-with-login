/** @type {import('next').NextConfig} */
const nextConfig = {
    cacheComponents: true, // Moved to root per warning
    experimental: {
        // dynamicIO was unrecognized, removing to prevent warnings
    },
};

export default nextConfig;
