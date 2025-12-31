
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }) {
    const pathname = usePathname();

    const navItems = [
        { name: 'Home', path: '/dashboard', icon: '🏠' },
        { name: 'Progress', path: '/dashboard/progress', icon: '📈' },
        { name: 'Learning', path: '/dashboard/learning', icon: '🎓' },
        { name: 'Alerts', path: '/dashboard/alerts', icon: '🔔' },
        { name: 'Me', path: '/dashboard/me', icon: '👤' },
    ];

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-logo">SmartVU</div>
                <nav style={{ flex: 1 }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link key={item.path} href={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
                                <span style={{ marginRight: '12px', fontSize: '1.2rem' }}>{item.icon}</span>
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
