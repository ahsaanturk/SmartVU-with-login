export default function manifest() {
    return {
        name: 'SmartVU',
        short_name: 'SmartVU',
        description: 'Premium Authentication & Learning Experience',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/next.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
        ],
    }
}
