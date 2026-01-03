
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ users: 0, courses: 0, content: 0, tasks: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            });
    }, []);

    const cards = [
        { title: 'Total Students', value: stats.users, icon: '👥', color: '#1cb0f6', link: '/admin/users' },
        { title: 'Active Courses', value: stats.courses, icon: '📚', color: '#58cc02', link: '/admin/courses' },
        { title: 'Learning Material', value: stats.content, icon: '📂', color: '#ff9600', link: '/admin/content' },
        { title: 'Pending Alerts', value: stats.tasks, icon: '🔔', color: '#ff4b4b', link: '/admin/tasks' },
    ];

    return (
        <div className="page-container" style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'flex-start',
            minHeight: 'auto'
        }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 className="title" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Dashboard</h1>
                <p className="subtitle">Overview of your academy.</p>
            </div>

            {/* Quick Actions (Horizontal Scroll on Mobile) */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{
                    display: 'flex',
                    gap: '16px',
                    overflowX: 'auto',
                    paddingBottom: '4px',
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none'  // IE 10+
                }}>
                    <style jsx>{`
                        div::-webkit-scrollbar { display: none; } /* Chrome/Safari */
                    `}</style>

                    <Link href="/admin/courses" className="btn btn-primary action-btn" style={{
                        minWidth: '140px',
                        background: '#2B2B2B',
                        boxShadow: '0 4px 0 #000',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        padding: '16px',
                        borderRadius: '16px'
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>+</span>
                        <span style={{ fontSize: '0.9rem' }}>NEW COURSE</span>
                    </Link>
                    <Link href="/admin/users/create" className="btn btn-primary action-btn" style={{
                        minWidth: '140px',
                        background: '#2B2B2B',
                        boxShadow: '0 4px 0 #000',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        padding: '16px',
                        borderRadius: '16px'
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>+</span>
                        <span style={{ fontSize: '0.9rem' }}>NEW STUDENT</span>
                    </Link>
                    <Link href="/admin/content/create" className="btn btn-primary action-btn" style={{
                        minWidth: '140px',
                        background: '#2B2B2B',
                        boxShadow: '0 4px 0 #000',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        padding: '16px',
                        borderRadius: '16px'
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>+</span>
                        <span style={{ fontSize: '0.9rem' }}>UPLOAD</span>
                    </Link>
                    <Link href="/admin/tasks" className="btn btn-primary action-btn" style={{
                        minWidth: '140px',
                        background: '#2B2B2B',
                        boxShadow: '0 4px 0 #000',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        padding: '16px',
                        borderRadius: '16px'
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>+</span>
                        <span style={{ fontSize: '0.9rem' }}>ALERT</span>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {cards.map((card) => (
                        <Link
                            key={card.title}
                            href={card.link}
                            className="stat-card hover-bounce"
                            style={{ cursor: 'pointer', borderBottom: `4px solid ${card.color}`, display: 'block', textDecoration: 'none' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1 }}>{loading ? '-' : card.value}</div>
                                    <div style={{ color: 'var(--text-muted)', fontWeight: '600', marginTop: '8px' }}>{card.title}</div>
                                </div>
                                <div style={{ fontSize: '2rem' }}>{card.icon}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
