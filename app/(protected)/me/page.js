
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

    const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const stats = user.stats || { lessonsCompleted: 0, quizAccuracy: 0, coursesEnrolled: 0 };

    const handleToggleNotifications = async () => {
        const newState = !user.emailNotifications;
        try {
            setUser(prev => ({ ...prev, emailNotifications: newState }));
            await fetch('/api/me/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailNotifications: newState })
            });
        } catch (error) {
            setUser(prev => ({ ...prev, emailNotifications: !newState }));
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '80px' }}>

            {/* Header / Hero */}
            <div style={{
                background: 'linear-gradient(135deg, #1cb0f6 0%, #178cc0 100%)',
                borderRadius: '20px',
                padding: '32px',
                color: 'white',
                marginBottom: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                boxShadow: '0 8px 0 #147bad'
            }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    border: '4px solid rgba(255,255,255,0.3)'
                }}>
                    👤
                </div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, display: 'flex', items: 'center', gap: '8px' }}>
                        {user.name}
                        {user.isVerified && <span title="Verified Student">✅</span>}
                    </h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9, fontWeight: '600' }}>
                        {user.email}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '12px', fontWeight: '700' }}>
                            Member since {joinedDate}
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{user.xp || 0}</div>
                    <div style={{ fontWeight: '700', opacity: 0.8 }}>TOTAL XP</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

                {/* Statistics Grid */}
                <div className="stat-card">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px', color: '#333' }}>Statistics</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ border: '2px solid #e5e5e5', borderRadius: '16px', padding: '16px' }}>
                            <div style={{ fontSize: '1.5rem' }}>🔥</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{user.streakDays || 0}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700' }}>Day Streak</div>
                        </div>
                        <div style={{ border: '2px solid #e5e5e5', borderRadius: '16px', padding: '16px' }}>
                            <div style={{ fontSize: '1.5rem' }}>🎯</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{stats.quizAccuracy}%</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700' }}>Quiz Accuracy</div>
                        </div>
                        <div style={{ border: '2px solid #e5e5e5', borderRadius: '16px', padding: '16px' }}>
                            <div style={{ fontSize: '1.5rem' }}>📚</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{stats.lessonsCompleted}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700' }}>Lessons Done</div>
                        </div>
                        <div style={{ border: '2px solid #e5e5e5', borderRadius: '16px', padding: '16px' }}>
                            <div style={{ fontSize: '1.5rem' }}>🎓</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{stats.coursesEnrolled}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700' }}>Courses</div>
                        </div>
                    </div>
                </div>

                {/* Academic Details */}
                <div className="stat-card">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px', color: '#333' }}>Academic Profile</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e5e5', paddingBottom: '12px' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>University</span>
                            <span style={{ fontWeight: '700', color: '#1cb0f6' }}>{user.university}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e5e5', paddingBottom: '12px' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Degree Program</span>
                            <span style={{ fontWeight: '700' }}>{user.degree} ({user.degreeLevel})</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e5e5', paddingBottom: '12px' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Current Semester</span>
                            <span style={{ fontWeight: '700' }}>{user.semester}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e5e5', paddingBottom: '12px' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Daily Goal</span>
                            <span style={{ fontWeight: '700' }}>{user.plannedStudyTime || 60} mins</span>
                        </div>

                        <div style={{ marginTop: 'auto' }}>
                            <button
                                onClick={() => router.push('/me/course-selection')}
                                className="btn"
                                style={{
                                    width: '100%',
                                    background: '#FFC800',
                                    boxShadow: '0 4px 0 #D9AA00',
                                    color: 'black',
                                    fontWeight: '700'
                                }}
                            >
                                UPDATE COURSES 📚
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings */}
            <div className="stat-card" style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px', color: '#333' }}>Preferences</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #e5e5e5' }}>
                        <div>
                            <div style={{ fontWeight: '700' }}>Email Notifications</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Get reminders about assignments & quiz deadlines</div>
                        </div>
                        <button
                            onClick={handleToggleNotifications}
                            className={`btn ${user.emailNotifications ? 'btn-primary' : ''}`}
                            style={{
                                width: 'auto',
                                padding: '8px 16px',
                                fontSize: '0.9rem',
                                background: user.emailNotifications ? undefined : '#e5e5e5',
                                color: user.emailNotifications ? undefined : '#afafaf',
                                boxShadow: user.emailNotifications ? undefined : 'none'
                            }}
                        >
                            {user.emailNotifications ? 'ON' : 'OFF'}
                        </button>
                    </div>
                    <div style={{ padding: '24px 0 8px 0' }}>
                        <button onClick={handleLogout} className="btn" style={{ background: 'transparent', border: '2px solid #e5e5e5', color: '#afafaf', fontWeight: '700' }}>
                            SIGN OUT OF ACCOUNT
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                SmartVU Student Portal • v1.0.0
            </div>
        </div>
    );
}
