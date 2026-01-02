
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

    return (
        <div className="dashboard-container">
            {/* Desktop Sidebar */}
            <aside className="sidebar" style={{ background: '#fff', width: '260px', borderRight: '2px solid #e5e5e5', display: 'flex', flexDirection: 'column' }}>
                <SidebarContent />
            </aside>

            {/* Mobile Header / Hamburger */}
            <div style={{ padding: '16px', background: 'white', borderBottom: '2px solid #e5e5e5', alignItems: 'center', justifyContent: 'space-between', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }} className="mobile-header">
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#2B2B2B' }}>SmartVU Admin</span>
                <button onClick={() => setIsMobileOpen(true)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#58cc02' }}>☰</button>
            </div>
            <style jsx global>{`
                .mobile-header { display: none !important; }
                @media (max-width: 768px) {
                    .mobile-header { display: flex !important; }
                    .main-content { margin-left: 0 !important; padding-top: 80px !important; }
                }
            `}</style>

            {/* Mobile Drawer Overlay */}
            <div className={`sidebar-overlay ${isMobileOpen ? 'open' : ''}`} onClick={() => setIsMobileOpen(false)} />

            {/* Mobile Drawer */}
            <aside className={`sidebar-drawer ${isMobileOpen ? 'open' : ''}`}>
                <SidebarContent />
            </aside>

            <main className="main-content" style={{ flex: 1, background: '#fcfcfc', overflowY: 'auto' }}>
                {children}
            </main>
        </div>
    );
}
