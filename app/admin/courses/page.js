
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ManageCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const router = useRouter();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        degree: ['BSCS'],
        semester: 1,
        description: ''
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = () => {
        fetch('/api/courses')
            .then(res => res.json())
            .then(data => {
                setCourses(data.courses || []);
                setLoading(false);
            });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/courses', {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            setShowForm(false);
            setFormData({ name: '', code: '', degree: ['BSCS'], semester: 1, description: '' });
            fetchCourses();
        } else {
            alert('Error creating course');
        }
    };

    if (loading) return <div className="page-container">Loading...</div>;

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="title">Courses</h1>
                    <p className="subtitle">Manage universities subjects.</p>
                </div>
                <button
                    className="btn btn-primary"
                    style={{ width: 'auto' }}
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'CANCEL' : '+ NEW COURSE'}
                </button>
            </div>

            {showForm && (
                <div className="stat-card" style={{ marginBottom: '32px', border: '2px solid #e5e5e5' }}>
                    <h3 style={{ marginBottom: '16px' }}>Create New Course</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
                        <div className="input-group">
                            <label>Course Name</label>
                            <input
                                className="input-field"
                                placeholder="e.g. Introduction to Programming"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Course Code</label>
                            <input
                                className="input-field"
                                placeholder="e.g. CS101"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px' }}>Degree Programs</label>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {['BSCS', 'BSIT', 'BSSE'].map(deg => (
                                    <label key={deg} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', background: '#f7f7f7', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.degree.includes(deg)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFormData({ ...formData, degree: [...formData.degree, deg] });
                                                } else {
                                                    setFormData({ ...formData, degree: formData.degree.filter(d => d !== deg) });
                                                }
                                            }}
                                            style={{ accentColor: '#58cc02', width: '16px', height: '16px' }}
                                        />
                                        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{deg}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Semester</label>
                            <input
                                type="number"
                                className="input-field"
                                min="1" max="8"
                                value={formData.semester}
                                onChange={e => setFormData({ ...formData, semester: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Description</label>
                            <textarea
                                className="input-field"
                                placeholder="Brief description..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>
                            CREATE COURSE
                        </button>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gap: '16px' }}>
                {courses.map(course => (
                    <div
                        key={course._id}
                        className="stat-card"
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.2s', border: '2px solid #e5e5e5' }}
                    >
                        <Link href={`/admin/courses/${course._id}`} style={{ flex: 1, textDecoration: 'none', color: 'inherit' }}>
                            <div>
                                <span style={{ fontWeight: '800', color: 'var(--primary)', marginRight: '12px' }}>{course.code}</span>
                                <span style={{ fontWeight: '700' }}>{course.name}</span>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                                    {(Array.isArray(course.degree) ? course.degree.join(', ') : course.degree)} • Semester {course.semester}
                                </p>
                            </div>
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Link href={`/admin/courses/${course._id}`} style={{ fontSize: '1.5rem', color: '#e5e5e5', textDecoration: 'none' }}>➔</Link>
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!confirm('Delete this course?')) return;
                                    const res = await fetch(`/api/courses/${course._id}`, { method: 'DELETE' });
                                    if (res.ok) setCourses(courses.filter(c => c._id !== course._id));
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                title="Delete Course"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
