import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
    dest: "public",
    disable: process.env.NODE_ENV === "development", // Disable PWA in dev
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        // dynamicIO was unrecognized, removing to prevent warnings
    },
};

export default withPWA(nextConfig);
