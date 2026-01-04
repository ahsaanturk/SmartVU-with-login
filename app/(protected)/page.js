
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation'; // Added headers

import LoadingScreen from '@/app/components/LoadingScreen';
import WelcomeOverlay from '@/app/components/WelcomeOverlay'; // Import

export default function DashboardHome() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams(); // Hook
    const router = useRouter(); // Hook

    const welcomeMode = searchParams.get('welcome'); // 'new' or 'back' or null
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        if (welcomeMode) {
            setShowWelcome(true);
        }
    }, [welcomeMode]);

    useEffect(() => {
        Promise.all([
            fetch('/api/dashboard/home', { cache: 'no-store' }).then(res => res.json()),
            fetch('/api/leaderboard', { cache: 'no-store' }).then(res => res.json())
        ]).then(([dashboardData, leaderboardData]) => {
            setData({
                ...dashboardData,
                weeklyLeaders: (leaderboardData?.weekly || []).slice(0, 3)
            });
            setLoading(false);
        });
    }, []);

    const handleDismissWelcome = () => {
        setShowWelcome(false);
        // Clean up URL
        router.replace('/');
    };

    if (loading) return <LoadingScreen />;
    if (!data) return <div className="page-container">Error loading data</div>;
    if (data.error) {
        if (typeof window !== 'undefined') window.location.href = '/login';
        return <div className="page-container">Redirecting...</div>;
    }

    const userData = data.user || {};

    return (
        <div>
            {/* Welcome Overlay */}
            {showWelcome && (
                <WelcomeOverlay
                    mode={welcomeMode}
                    userName={userData.name?.split(' ')[0]} // First name only for friendlier look
                    onDismiss={handleDismissWelcome}
                />
            )}

            {/* Header / Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#333' }}>Welcome, {userData.name}!</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Ready to learn?</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Link href="/progress"
                        className="animate-pop-in"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 16px', background: 'white',
                            border: '2px solid #e5e5e5', borderRadius: '16px',
                            textDecoration: 'none', color: '#333',
                            fontWeight: '700', cursor: 'pointer',
                            transition: 'transform 0.1s ease'
                        }}>
                        <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🔥</span>
                        <span style={{ color: userData.streak > 0 ? '#ff9600' : '#e5e5e5' }}>{userData.streak}</span>
                    </Link>
                    <div className="stat-card" style={{ padding: '8px 16px', width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem', color: '#ffbd00' }}>⚡</span>
                        <span>{userData.xp} XP</span>
                    </div>
                </div>
            </div>

            {/* Concept of the Day */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <div className="stat-card" style={{ flex: 2, minWidth: '300px', background: '#58cc02', color: 'white', border: 'none', boxShadow: '0 4px 0 #46a302' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>Concept of the Day</h3>
                    <p style={{ fontWeight: '600' }}>{data.concept.title}: {data.concept.description}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repea(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                {/* Tasks Section */}
                <div style={{ flex: 2 }}>
                    <h2 className="title" style={{ textAlign: 'left', marginBottom: '20px' }}>Up Next</h2>
                    {data.tasks.length === 0 ? (
                        <div className="stat-card">
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No pending tasks! 🎉</p>
                            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                <Link href="/alerts?filter=Missed" style={{ color: '#1cb0f6', textDecoration: 'none', fontWeight: 'bold' }}>
                                    Check Missed Tasks
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {data.tasks.map(task => {
                                const now = new Date();
                                const due = new Date(task.dueDate);
                                const diffMs = due - now;
                                const diffHours = diffMs / (1000 * 60 * 60);
                                const isUrgent = diffHours < 24;

                                const timeLeft = diffHours > 0
                                    ? `${Math.floor(diffHours)}h ${Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))}m`
                                    : 'Overdue';

                                return (
                                    <div key={task._id} className={`task-card ${isUrgent ? 'urgent' : ''}`}>
                                        <div>
                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                                                <span style={{
                                                    background: task.type === 'Quiz' ? '#1cb0f6' : '#ff9600',
                                                    color: 'white',
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '800'
                                                }}>
                                                    {task.type}
                                                </span>
                                                <span style={{ fontWeight: '800', color: 'var(--text-muted)' }}>{task.courseCode}</span>
                                            </div>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{task.title}</h4>
                                            <p style={{ color: isUrgent ? '#ea2b2b' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>
                                                ⏰ {timeLeft}
                                            </p>
                                        </div>
                                        <Link
                                            href={task.type === 'Quiz' ? `/learning/practice/${task._id}` : '/learning'}
                                            className="btn btn-primary"
                                            style={{ width: 'auto', padding: '10px 16px', fontSize: '0.9rem' }}
                                        >
                                            {task.type === 'Quiz' ? 'PRACTICE' : 'VIEW DETAILS'}
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <Link href="/alerts?filter=Missed" style={{ color: '#afafaf', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 'bold' }}>
                            View Missed Tasks
                        </Link>
                    </div>
                </div>

                {/* Sidebar Widgets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                    <div className="stat-card">
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px', color: '#ff9600' }}>🏆 Weekly Top 3</h3>
                        {data.weeklyLeaders && data.weeklyLeaders.length > 0 ? (
                            data.weeklyLeaders.map((student, i) => (
                                <div key={student._id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    padding: '8px',
                                    background: student.name === data.user.name ? '#dfffd6' : 'transparent',
                                    borderRadius: '8px'
                                }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <span style={{ color: 'var(--text-muted)', width: '20px' }}>{i + 1}.</span>
                                        <span>{student.name}</span>
                                    </div>
                                    <span style={{ color: '#1cb0f6' }}>{student.weeklyXP || 0} XP</span>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--text-muted)' }}>No data yet.</p>
                        )}
                    </div>

                    <div className="stat-card" style={{ background: '#ff9600', color: 'white', border: 'none', boxShadow: '0 4px 0 #cc7800' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '8px' }}>Quote of the Day</h3>
                        <p style={{ fontStyle: 'italic', fontWeight: '600' }}>"{data.quote.description}"</p>
                        <p style={{ textAlign: 'right', marginTop: '8px', fontSize: '0.9rem' }}>- {data.quote.author}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
