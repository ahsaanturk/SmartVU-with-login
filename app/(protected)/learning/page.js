
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LearningPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('courses');
    const [resources, setResources] = useState([]);
    const [fetchingMulti, setFetchingMulti] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/api/me').then(res => res.json()),
            fetch('/api/courses').then(res => res.json())
        ]).then(([userData, coursesData]) => {
            if (userData.user && userData.user.selectedCourses) {
                const selectedCodes = userData.user.selectedCourses; // Array of strings e.g. ["CS101", "MTH101"]
                const allCourses = coursesData.courses || [];

                // Filter DB courses that match the selected codes
                // If a selected course is not in DB yet, we might want to show a placeholder or filter it out.
                // For MVP, we show matched ones.
                const matchedCourses = allCourses.filter(c => selectedCodes.includes(c.code));
                setCourses(matchedCourses);
            }
        }).finally(() => setLoading(false));
    }, []);

    // Fetch resources for Practice/Library tabs
    useEffect(() => {
        if (activeTab === 'courses') return;

        setFetchingMulti(true);
        const type = activeTab === 'practice' ? 'Quiz' : 'Handout';

        fetch(`/api/learning/resources?type=${type}`)
            .then(res => res.json())
            .then(data => {
                if (data.resources) setResources(data.resources);
            })
            .finally(() => setFetchingMulti(false));
    }, [activeTab]);

    if (loading) return <div className="page-container">Loading...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="title" style={{ textAlign: 'left', marginBottom: '32px' }}>Learning Center</h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '2px solid #e5e5e5' }}>
                {['courses', 'practice', 'library'].map(tab => (
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
                            marginBottom: '-2px',
                            textTransform: 'uppercase'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Courses Tab (Folders) */}
            {activeTab === 'courses' && (
                <div>
                    <p className="subtitle" style={{ textAlign: 'left' }}>Your selected courses</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {courses.length === 0 ? (
                            <div className="stat-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                                <p>No courses selected or found in database.</p>
                                <Link href="/me/course-selection" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block', width: 'auto' }}>
                                    SELECT COURSES
                                </Link>
                            </div>
                        ) : (
                            courses.map(course => (
                                <Link
                                    key={course._id}
                                    href={`/learning/${course._id}`}
                                    className="stat-card"
                                    style={{ cursor: 'pointer', border: '2px solid #e5e5e5', transition: '0.2s', display: 'block', textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div style={{ background: 'var(--primary)', color: 'white', padding: '8px 12px', borderRadius: '8px', display: 'inline-block', fontWeight: '800', marginBottom: '12px' }}>
                                        {course.code}
                                    </div>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{course.name || course.title}</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>{course.description || 'Start learning now'}</p>

                                    <div style={{ height: '8px', background: '#e5e5e5', borderRadius: '4px', marginTop: '16px', overflow: 'hidden' }}>
                                        <div style={{ width: '0%', height: '100%', background: 'var(--primary)' }}></div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Practice Tab (Quizzes) */}
            {activeTab === 'practice' && (
                <div>
                    {fetchingMulti ? <p>Loading quizzes...</p> : (
                        resources.length === 0 ? (
                            <div className="stat-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                <h3>No quizzes found.</h3>
                                <p>Admin hasn't uploaded any practice quizzes for your courses yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '20px' }}>
                                {resources.map(res => (
                                    <div key={res._id} className="task-card">
                                        <div>
                                            <span style={{ color: 'var(--text-muted)', fontWeight: '800' }}>{res.courseCode}</span>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{res.title}</h3>
                                            <p style={{ color: 'var(--text-muted)' }}>{res.questions?.length || 0} Questions</p>
                                        </div>
                                        <button className="btn btn-primary" style={{ width: 'auto' }}>START</button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            )}

            {/* Library Tab (Handouts) */}
            {activeTab === 'library' && (
                <div>
                    {fetchingMulti ? <p>Loading materials...</p> : (
                        resources.length === 0 ? (
                            <div className="stat-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                <h3>No handouts found.</h3>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                                {resources.map(res => (
                                    <Link href={res.resourceLink || '#'} target="_blank" key={res._id} className="stat-card" style={{ textAlign: 'center', cursor: 'pointer' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📄</div>
                                        <h4 style={{ fontWeight: '700' }}>{res.title}</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{res.courseCode}</p>
                                    </Link>
                                ))}
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
