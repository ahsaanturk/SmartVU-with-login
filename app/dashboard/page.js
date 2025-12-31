
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardHome() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard/home')
            .then(res => res.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="page-container">Loading...</div>;
    if (!data) return <div className="page-container">Error loading data</div>;

    return (
        <div>
            {/* Header / Stats */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <div className="stat-card" style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '2.5rem' }}>🔥</span>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{data.user?.streak || 0}</h3>
                        <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Day Streak</p>
                    </div>
                </div>

                <div className="stat-card" style={{ flex: 2, minWidth: '300px', background: '#58cc02', color: 'white', border: 'none', boxShadow: '0 4px 0 #46a302' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>Concept of the Day</h3>
                    <p style={{ fontWeight: '600' }}>{data.concept.title}: {data.concept.description}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repea(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                {/* Tasks Section */}
                <div>
                    <h2 className="title" style={{ textAlign: 'left', marginBottom: '20px' }}>Up Next</h2>
                    {data.tasks.length === 0 ? (
                        <div className="stat-card">
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No pending tasks! 🎉</p>
                        </div>
                    ) : (
                        data.tasks.map(task => {
                            const now = new Date();
                            const due = new Date(task.dueDate);
                            const diffMs = due - now;
                            const diffHours = diffMs / (1000 * 60 * 60);
                            const isUrgent = diffHours < 24;

                            // Simple formatting
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
                                    <Link href="/dashboard/learning" className="btn btn-primary" style={{ width: 'auto', padding: '10px 16px', fontSize: '0.9rem' }}>
                                        PRACTICE
                                    </Link>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Sidebar Widgets (Desktop) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="stat-card">
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px' }}>Weekly Leaderboard</h3>
                        {/* Mock Data */}
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: '600' }}>
                                <span>{i}. Student {i}</span>
                                <span style={{ color: 'var(--primary)' }}>{100 - i * 10} XP</span>
                            </div>
                        ))}
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
