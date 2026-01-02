
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
        <div className="page-container">
            <h1 className="title">Dashboard</h1>
            <p className="subtitle">Welcome back, Admin.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginTop: '32px' }}>
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

            <div style={{ marginTop: '48px' }}>
                <h3 className="section-header">Quick Actions</h3>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <Link href="/admin/users/create" className="btn btn-primary" style={{ width: 'auto', background: '#2B2B2B', boxShadow: '0 4px 0 #000' }}>
                        + NEW STUDENT
                    </Link>
                    <Link href="/admin/courses" className="btn btn-primary" style={{ width: 'auto', background: '#2B2B2B', boxShadow: '0 4px 0 #000' }}>
                        + NEW COURSE
                    </Link>
                    <Link href="/admin/content/create" className="btn btn-primary" style={{ width: 'auto', background: '#2B2B2B', boxShadow: '0 4px 0 #000' }}>
                        + UPLOAD CONTENT
                    </Link>
                    <Link href="/admin/tasks" className="btn btn-primary" style={{ width: 'auto', background: '#2B2B2B', boxShadow: '0 4px 0 #000' }}>
                        + POST ALERT
                    </Link>
                </div>
            </div>
        </div>
    );
}
