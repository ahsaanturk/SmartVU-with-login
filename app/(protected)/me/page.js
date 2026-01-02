
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) setUser(data.user);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    if (loading) return <div className="page-container">Loading...</div>;
    if (!user) return <div className="page-container">Error loading profile</div>;

    const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 className="title" style={{ marginBottom: '40px' }}>My Profile</h1>

            <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                    👤
                </div>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{user.name}</h2>
                    <p style={{ color: 'var(--text-muted)', fontWeight: '700' }}>{user.degree} ({user.degreeLevel}) • Semester {user.semester}</p>
                    <p style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '600', marginTop: '4px' }}>{user.university}</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🇵🇰</span>
                        <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Joined {joinedDate}</span>
                    </div>
                </div>
            </div>

            <div className="stat-card">
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px' }}>Settings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e5e5e5' }}>
                        <span style={{ fontWeight: '700' }}>Email Notifications</span>
                        <button className="btn btn-primary" style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}>ON</button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e5e5e5' }}>
                        <span style={{ fontWeight: '700' }}>Sound Effects</span>
                        <button className="btn btn-primary" style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', background: '#e5e5e5', color: '#afafaf', boxShadow: 'none' }}>OFF</button>
                    </div>
                    <button onClick={() => router.push('/me/course-selection')} className="btn btn-primary" style={{ marginTop: '20px', background: '#FFC800', boxShadow: '0 4px 0 #D9AA00', color: 'black' }}>
                        📚 COURSE SELECTION
                    </button>
                    <button onClick={handleLogout} className="btn btn-primary" style={{ marginTop: '10px', background: '#ea2b2b', boxShadow: '0 4px 0 #a60000' }}>
                        SIGN OUT
                    </button>
                </div>
            </div>
        </div>
    );
}
