
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ContentPage() {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = () => {
        setLoading(true);
        // If we want filtering on server side, we can pass query param, but for small amount of data client filter is fine/smoother.
        // Actually let's fetch all and filter here.
        fetch('/api/admin/content')
            .then(res => res.json())
            .then(data => {
                setContent(data.content || []);
                setLoading(false);
            });
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this item? Is it safe?')) return;
        const res = await fetch(`/api/admin/content/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setContent(content.filter(c => c._id !== id));
        }
    };

    const filteredContent = filter === 'All' ? content : content.filter(c => c.type === filter);

    const tabs = ['All', 'Lecture', 'Handout', 'Quiz', 'Quote', 'Concept'];

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="title">Content Library</h1>
                    <p className="subtitle">Manage lectures, handouts & quotes.</p>
                </div>
                <Link href="/admin/content/create" className="btn btn-primary" style={{ width: 'auto' }}>
                    + UPLOAD NEW
                </Link>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '12px',
                            border: 'none',
                            fontWeight: '700',
                            background: filter === tab ? '#58cc02' : '#e5e5e5',
                            color: filter === tab ? 'white' : '#777',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? <p>Loading...</p> : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {filteredContent.map(item => (
                        <div key={item._id} className="stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '2px solid #e5e5e5' }}>
                            <div>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{
                                        background: '#ddf4ff', color: '#1cb0f6',
                                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold'
                                    }}>
                                        {item.type.toUpperCase()}
                                    </span>
                                    {item.courseCode && (
                                        <span style={{
                                            background: '#f7f7f7', color: '#777',
                                            padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold'
                                        }}>
                                            {item.courseCode}
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{item.title || item.courseCode || 'Untitled'}</div>
                                {(item.description || item.author) && (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px', maxWidth: '600px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.author && <b>{item.author}: </b>}
                                        {item.description}
                                    </p>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: '#ccc' }}>{new Date(item.date).toLocaleDateString()}</span>
                                <Link href={`/admin/content/${item._id}`} style={{ fontSize: '1.2rem', textDecoration: 'none' }} title="Edit">
                                    ✏️
                                </Link>
                                <button
                                    onClick={() => handleDelete(item._id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                    title="Delete Item"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredContent.length === 0 && (
                        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No content found in this category.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
