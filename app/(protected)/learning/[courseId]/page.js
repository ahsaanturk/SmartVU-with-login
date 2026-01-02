
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

export default function CourseMapPage({ params }) {
    // Unwrap params for Next.js 15+
    const unwrapParams = use(params);
    const { courseId } = unwrapParams;

    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/courses/${courseId}`)
            .then(res => res.json())
            .then(data => {
                if (data.course) {
                    setCourse(data.course);
                    setModules(data.modules);
                }
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, [courseId]);

    if (loading) return <div className="page-container">Loading path...</div>;
    if (!course) return <div className="page-container">Course not found</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', padding: '16px 0', borderBottom: '2px solid #e5e5e5', zIndex: 10, display: 'flex', alignItems: 'center', gap: '16px', backdropFilter: 'blur(5px)' }}>
                <Link href="/learning" style={{ fontSize: '1.5rem', textDecoration: 'none' }}>Running late...</Link>
                <div>
                    <h2 style={{ fontSize: '1.1rem', margin: 0 }}>{course.code}</h2>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{course.name}</p>
                </div>
            </div>

            {/* Map */}
            <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
                {modules.length === 0 ? (
                    <div className="stat-card" style={{ textAlign: 'center' }}>
                        <p>No modules loaded yet.</p>
                    </div>
                ) : (
                    modules.map((module, cIndex) => (
                        <div key={module._id} className="animate-pop-in">
                            {/* Module Header */}
                            <div style={{ background: '#58cc02', color: 'white', padding: '16px', borderRadius: '16px', marginBottom: '24px', textAlign: 'center', boxShadow: '0 4px 0 #46a302' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Unit {cIndex + 1}</h3>
                                <p>{module.title}</p>
                            </div>

                            {/* Lessons Path */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                                {module.lessons.map((lesson, lIndex) => {
                                    // Calculate offset for "winding path" look
                                    // 0 -> center, 1 -> left, 2 -> center, 3 -> right ...
                                    const offset = (lIndex % 4 === 1) ? '-40px' : (lIndex % 4 === 3) ? '40px' : '0px';

                                    return (
                                        <Link
                                            key={lesson._id}
                                            href={`/learning/${courseId}/lesson/${lesson._id}`}
                                            style={{
                                                textDecoration: 'none',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                transform: `translateX(${offset})`
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: '70px',
                                                    height: '70px',
                                                    background: '#ff9600',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 6px 0 #cc7800',
                                                    marginBottom: '10px',
                                                    position: 'relative'
                                                }}
                                                className="hover-bounce"
                                            >
                                                <span style={{ fontSize: '2rem' }}>★</span>
                                            </div>
                                            <span style={{ color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.9rem' }}>{lesson.title}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
