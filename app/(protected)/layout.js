
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }) {
    const pathname = usePathname();

    const navItems = [
        { name: 'Home', path: '/', icon: '🏠' },
        { name: 'Progress', path: '/progress', icon: '📈' },
        { name: 'Learning', path: '/learning', icon: '🎓' },
        { name: 'Alerts', path: '/alerts', icon: '🔔' },
        { name: 'Me', path: '/me', icon: '👤' },
    ];

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-logo">SmartVU</div>
                <nav style={{ flex: 1 }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        const isMain = item.name === 'Learning';
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`nav-item ${isActive ? 'active' : ''} ${isMain ? 'nav-item-floating' : ''}`}
                            >
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
