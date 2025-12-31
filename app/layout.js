
import './globals.css';

export const metadata = {
    title: 'SmartVU',
    description: 'Premium Authentication Experience',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
