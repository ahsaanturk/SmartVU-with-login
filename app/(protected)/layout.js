
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import SessionVerifier from '@/app/components/SessionVerifier';

export default function DashboardLayout({ children }) {
    const pathname = usePathname();

    const [verifying, setVerifying] = useState(true);

    // Global Session Verification
    useEffect(() => {
        // Simple check to ensure user still exists in DB
        // This prevents "Zombie Sessions" where cookie is valid but user is deleted
        fetch('/api/me')
            .then(res => {
                if (res.status === 401 || res.status === 404) {
                    throw new Error('Session invalid');
                }
                return res.json();
            })
            .then(() => setVerifying(false))
            .catch(() => {
                // Force Logout
                fetch('/api/auth/logout', { method: 'POST' }); // Cleanup cookie
                window.location.href = '/login'; // Hard redirect
            });
    }, []);

    const navItems = [
        { name: 'Home', path: '/', icon: '🏠' },
        { name: 'Progress', path: '/progress', icon: '📈' },
        { name: 'Learning', path: '/learning', icon: '🎓' },
        { name: 'Alerts', path: '/alerts', icon: '🔔' },
        { name: 'Me', path: '/me', icon: '👤' },
    ];

    // Optional: Show loading spinner while verifying? 
    // For smoother UX, we might skip a full blocker, but for "deleted user" safety, a blocker is better.
    // Let's keep it non-blocking but with the redirect logic ready, 
    // OR just block rendering to prevent the "unusual behavior" (flashing, hydration errors).
    // Given the user report, blocking is safer.
    if (verifying) {
        return <SessionVerifier />;
    }

    return (
        <div className="dashboard-container">
            {/* Desktop Sidebar */}
            <aside className="sidebar desktop-only">
                <div className="sidebar-logo">SmartVU</div>
                <nav style={{ flex: 1 }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <span style={{ marginRight: '12px', fontSize: '1.2rem' }}>{item.icon}</span>
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="mobile-only mobile-bottom-nav">
                {navItems.map((item) => {
                    const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
                    const isProminent = item.name === 'Learning';

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`nav-item-mobile ${isProminent ? 'prominent' : ''} ${isActive ? 'active' : ''}`}
                        >
                            <span style={{ fontSize: isProminent ? '1.8rem' : '1.4rem', marginBottom: isProminent ? '0' : '4px' }}>{item.icon}</span>
                            {!isProminent && <span style={{ fontSize: '0.7rem', fontWeight: '700' }}>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            <style jsx global>{`
                /* Desktop Only */
                .desktop-only {
                    display: flex !important;
                }
                .mobile-only {
                    display: none !important;
                }
                
                /* Mobile Nav Container - FIXED and UNMOVABLE */
                .mobile-bottom-nav {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    width: 100%;
                    height: 70px;
                    background: white;
                    border-top: 2px solid #e5e5e5;
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    z-index: 9999; /* Maintain On Top */
                    padding-bottom: env(safe-area-inset-bottom);
                    box-shadow: 0 -4px 12px rgba(0,0,0,0.05); /* Subtle shadow separator */
                }

                /* Mobile Nav Item */
                .nav-item-mobile {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    flex: 1;
                    height: 100%;
                    color: #777;
                    text-decoration: none;
                    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border-top: 2px solid transparent;
                    user-select: none;
                    -webkit-tap-highlight-color: transparent;
                }

                .nav-item-mobile.active {
                    color: #1cb0f6;
                    border-top-color: #1cb0f6;
                    background: #ddf4ff40;
                }

                /* Prominent Center Button (TikTok/YouTube style) */
                .nav-item-mobile.prominent {
                    flex: 0 0 64px; /* Fixed size, don't stretch */
                    height: 64px;
                    width: 64px;
                    background: var(--primary); /* Green or Brand Color */
                    border-radius: 50%;
                    color: white !important;
                    margin-bottom: 30px; /* Float Up */
                    border: 4px solid white; /* Cutout effect */
                    box-shadow: 0 4px 10px rgba(88, 204, 2, 0.4);
                    border-top-color: white; /* Override padding border */
                    background-clip: padding-box;
                }

                .nav-item-mobile.prominent.active {
                    background: #46a302; /* Darker green when active */
                    color: white !important;
                    border-top: 4px solid white; /* Keep cutout */
                    transform: scale(1.1);
                }

                .nav-item-mobile.prominent:active {
                    transform: scale(0.95);
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                }

                /* Responsive Logic */
                @media (max-width: 768px) {
                    .desktop-only {
                        display: none !important;
                    }
                    .mobile-only {
                        display: flex !important;
                    }

                    /* 
                       Strict Scroll Control:
                       The dashboard container becomes the root.
                    */
                    .main-content {
                        margin-left: 0 !important;
                        padding-bottom: 90px !important; /* Space for bottom nav */
                        padding-top: 20px !important;
                        padding-left: 16px !important;
                        padding-right: 16px !important;
                        width: 100%;
                        overflow-x: hidden; /* NO horizontal scroll */
                    }
                    
                    body {
                        overflow-x: hidden; /* Redundant safety */
                    }
                }
            `}</style>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
