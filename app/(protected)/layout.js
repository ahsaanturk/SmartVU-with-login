'use client';

import { useEffect, useState, Suspense } from 'react';
import SessionVerifier from '@/app/components/SessionVerifier';
import DashboardNavigation from '@/app/components/DashboardNavigation';

export default function DashboardLayout({ children }) {
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

    if (verifying) {
        return <SessionVerifier />;
    }

    return (
        <div className="dashboard-container">
            <Suspense fallback={<div className="sidebar desktop-only"></div>}>
                <DashboardNavigation />
            </Suspense>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
