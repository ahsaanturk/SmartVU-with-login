
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

export default function EditTask() {
    const { id } = useParams();
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        courseCode: '',
        type: 'Quiz',
        dueDate: '',
        description: '',
        quizQuestionsJson: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [availableCourses, setAvailableCourses] = useState([]);

    useEffect(() => {
        const init = async () => {
            await Promise.all([fetchTask(), fetchCourses()]);
            setLoading(false);
        };
        init();
    }, [id]);

    const fetchTask = async () => {
        try {
            const res = await fetch(`/api/tasks/${id}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            const t = data.task;

            setFormData({
                title: t.title,
                courseCode: t.courseCode,
                type: t.type,
                dueDate: new Date(t.dueDate).toISOString().split('T')[0],
                description: t.description || '',
                quizQuestionsJson: t.quizQuestions ? JSON.stringify(t.quizQuestions, null, 2) : ''
            });
        } catch (error) {
            alert('Error loading task');
            router.push('/admin/tasks');
        }
    };

    const fetchCourses = async () => {
        const res = await fetch('/api/courses');
        const data = await res.json();
        setAvailableCourses(data.courses || []);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...formData };
            if (formData.type === 'Quiz' && formData.quizQuestionsJson) {
                try {
                    payload.quizQuestions = JSON.parse(formData.quizQuestionsJson);
                } catch (err) {
                    alert('Invalid JSON in Quiz Questions');
                    setSaving(false);
                    return;
                }
            }

            const res = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Task Updated!');
                router.push('/admin/tasks');
            } else {
                alert('Update failed');
            }
        } catch (error) {
            alert('Error saving task');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="page-container">Loading...</div>;

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
            <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}>
                <Link href="/admin/tasks" style={{ color: 'var(--text-muted)', fontWeight: '700', marginBottom: '16px', display: 'inline-block' }}>
                    ← BACK TO ALERTS
                </Link>

                <h1 className="title" style={{ textAlign: 'left' }}>Edit Task</h1>

                <div className="stat-card" style={{ marginBottom: '40px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
                        <div className="input-group">
                            <label>Title</label>
                            <input
                                className="input-field"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="input-group">
                                <label>Course</label>
                                <select
                                    className="input-field"
                                    value={formData.courseCode}
                                    onChange={e => setFormData({ ...formData, courseCode: e.target.value })}
                                    required
                                >
                                    {availableCourses.map(c => (
                                        <option key={c._id} value={c.code}>{c.code}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Type</label>
                                <select
                                    className="input-field"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="Quiz">Quiz</option>
                                    <option value="Assignment">Assignment</option>
                                    <option value="GDB">GDB</option>
                                    <option value="Announcement">Announcement</option>
                                </select>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Due Date</label>
                            <input
                                type="date"
                                className="input-field"
                                value={formData.dueDate}
                                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Description</label>
                            <textarea
                                className="input-field"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {formData.type === 'Quiz' && (
                            <div className="input-group" style={{ background: '#e5f6fd', padding: '16px', borderRadius: '12px', border: '1px solid #1cb0f6' }}>
                                <label style={{ fontWeight: 'bold', color: '#1cb0f6' }}>Questions (JSON)</label>
                                <textarea
                                    className="input-field"
                                    style={{ fontFamily: 'monospace', minHeight: '150px' }}
                                    value={formData.quizQuestionsJson}
                                    onChange={e => setFormData({ ...formData, quizQuestionsJson: e.target.value })}
                                />
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'SAVING...' : 'UPDATE TASK'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
