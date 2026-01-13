'use client';

import { Suspense } from 'react';
import AdminNavigation from '@/app/components/AdminNavigation';

export default function AdminLayout({ children }) {
    return (
        <div className="dashboard-container">
            <Suspense fallback={<div className="sidebar desktop-only" style={{ width: '260px' }}></div>}>
                <AdminNavigation />
            </Suspense>

            <main className="main-content" style={{ flex: 1, background: '#fcfcfc', overflowY: 'auto' }}>
                {children}
            </main>
        </div>
    );
}
