
'use client';

import { useState } from 'react';

export default function LearningPage() {
    const [activeTab, setActiveTab] = useState('LMS');

    const tabs = ['LMS', 'Practice', 'Materials'];

    return (
        <div>
            <h1 className="title" style={{ textAlign: 'left', marginBottom: '32px' }}>Learning Center</h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '2px solid #e5e5e5' }}>
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab ? '4px solid #1cb0f6' : '4px solid transparent',
                            padding: '12px 24px',
                            fontSize: '1rem',
                            fontWeight: '800',
                            color: activeTab === tab ? '#1cb0f6' : 'var(--text-muted)',
                            cursor: 'pointer',
                            marginBottom: '-2px'
                        }}
                    >
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="animate-pop-in">
                {activeTab === 'LMS' && (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div className="task-card">
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontWeight: '800' }}>CS101</span>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Introduction to Computing</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Lecture 24: Data Structures</p>
                            </div>
                            <button className="btn btn-primary" style={{ width: 'auto' }}>WATCH</button>
                        </div>
                        <div className="task-card">
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontWeight: '800' }}>MTH101</span>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Calculus I</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Lecture 12: Functions</p>
                            </div>
                            <button className="btn btn-primary" style={{ width: 'auto' }}>WATCH</button>
                        </div>
                    </div>
                )}

                {activeTab === 'Practice' && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        <h3>No active practice quizzes.</h3>
                        <p>Check back later or review your alerts!</p>
                    </div>
                )}

                {activeTab === 'Materials' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="stat-card" style={{ textAlign: 'center', cursor: 'pointer' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📄</div>
                                <h4 style={{ fontWeight: '700' }}>Handout {i}.pdf</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>CS101 • 2.4 MB</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
