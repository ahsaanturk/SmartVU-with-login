
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: '📊' },
        { name: 'Users', path: '/admin/users', icon: '👥' },
        { name: 'Courses', path: '/admin/courses', icon: '📚' },
        { name: 'Content', path: '/admin/content', icon: '📂' },
        { name: 'Tasks & Alerts', path: '/admin/tasks', icon: '🔔' },
    ];

    const SidebarContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="sidebar-logo" style={{ color: '#2B2B2B', fontSize: '1.5rem', padding: '24px', borderBottom: '1px solid #e5e5e5' }}>
                SmartVU <span style={{ color: '#58cc02', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Admin</span>
            </div>
            <nav style={{ flex: 1, padding: '16px' }}>
                {navItems.map((item) => {
                    const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            onClick={() => setIsMobileOpen(false)}
                            className={`nav-item`}
                            style={{
                                color: isActive ? '#58cc02' : '#777',
                                background: isActive ? 'rgba(88, 204, 2, 0.1)' : 'transparent',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                transition: '0.2s',
                                fontWeight: isActive ? '700' : '600',
                                border: 'none'
                            }}
                        >
                            <span style={{ marginRight: '16px', fontSize: '1.2rem' }}>{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
            <div style={{ padding: '24px', borderTop: '1px solid #e5e5e5' }}>
                <Link href="/" style={{ color: '#777', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '8px' }}>←</span> Exit Admin
                </Link>
            </div>
        </div>
    );
    // Determine Mobile Header Title
    const getPageTitle = () => {
        if (pathname === '/admin') return 'Dashboard';
        if (pathname.includes('/users')) return 'Students';
        if (pathname.includes('/courses')) return 'Courses';
        if (pathname.includes('/content')) return 'Content';
        if (pathname.includes('/tasks')) return 'Alerts';
        return 'Admin';
    };

    return (
        <div className="dashboard-container">
            {/* Desktop Sidebar (Left) */}
            <aside className="sidebar desktop-only" style={{ background: '#fff', width: '260px', borderRight: '2px solid #e5e5e5', display: 'flex', flexDirection: 'column' }}>
                <SidebarContent />
            </aside>

            {/* Mobile Bottom Navigation (Fixed Bottom) */}
            <nav className="mobile-only mobile-bottom-nav">
                {navItems.map((item) => {
                    const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '8px',
                                color: isActive ? '#58cc02' : '#777',
                                textDecoration: 'none',
                                background: isActive ? 'rgba(88, 204, 2, 0.05)' : 'transparent',
                            }}
                        >
                            <span style={{ fontSize: '1.4rem', lineHeight: 1, marginBottom: '4px' }}>{item.icon}</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: isActive ? '700' : '600' }}>{item.name.split(' ')[0]}</span>
                        </Link>
                    );
                })}
            </nav>

            <style jsx global>{`
                /* Default Desktop */
                .dashboard-container {
                    display: flex;
                    height: 100vh;
                    overflow: hidden;
                }
                .mobile-only {
                    display: none !important;
                }
                
                /* Mobile Styles */
                @media (max-width: 768px) {
                    .desktop-only {
                        display: none !important;
                    }
                    .mobile-only {
                        display: flex !important;
                    }

                    /* Bottom Nav Styling */
                    .mobile-bottom-nav {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 70px;
                        background: white;
                        border-top: 2px solid #e5e5e5;
                        z-index: 100;
                        padding-bottom: env(safe-area-inset-bottom); /* iOS Safe Area */
                    }

                    .main-content {
                        padding-bottom: 90px !important; /* Space for bottom nav */
                    }
                }
            `}</style>

            <main className="main-content" style={{ flex: 1, background: '#fcfcfc', overflowY: 'auto' }}>
                {children}
            </main>
        </div>
    );
}
