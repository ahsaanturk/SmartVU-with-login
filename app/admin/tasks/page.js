'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function CreateTaskContent() {
    const [formData, setFormData] = useState({
        title: '',
        courseCode: '',
        type: 'Quiz',
        dueDate: '',
        description: '',
        quizQuestionsJson: ''
    });
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [activeTab, setActiveTab] = useState('today'); // 'today' | 'week' | 'all'
    const [filteredTasks, setFilteredTasks] = useState([]);

    useEffect(() => {
        fetchTasks();
        fetchCourses();
    }, []);

    const fetchTasks = () => {
        // Fetch ALL tasks for admin to handle "Total" view
        // The API now supports status=All for admins
        fetch('/api/tasks?status=All')
            .then(res => res.json())
            .then(data => setTasks(data.tasks || []));
    };

    const fetchCourses = () => {
        fetch('/api/courses')
            .then(res => res.json())
            .then(data => setAvailableCourses(data.courses || []));
    };

    // Filter Logic - Moved to Effect/Sync to prevent hydration mismatch with new Date()
    useEffect(() => {
        const now = new Date();
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7));

        let filtered = [];
        if (activeTab === 'today') {
            filtered = tasks.filter(t => new Date(t.createdAt) >= startOfToday);
        } else if (activeTab === 'week') {
            filtered = tasks.filter(t => new Date(t.createdAt) >= oneWeekAgo);
        } else {
            filtered = tasks; // 'all'
        }
        setFilteredTasks(filtered);
    }, [tasks, activeTab]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.courseCode) {
            alert('Please select a course');
            return;
        }
        setLoading(true);

        try {
            const payload = { ...formData };
            if (formData.type === 'Quiz' && formData.quizQuestionsJson) {
                try {
                    payload.quizQuestions = JSON.parse(formData.quizQuestionsJson);
                } catch (err) {
                    alert('Invalid JSON in Quiz Questions');
                    setLoading(false);
                    return;
                }
            }

            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Alert/Task Created!');
                setFormData({ title: '', courseCode: '', type: 'Quiz', dueDate: '', description: '', quizQuestionsJson: '' });
                fetchTasks();
                setActiveTab('today'); // Switch to recent to see new task
            } else {
                const data = await res.json();
                alert('Failed to create task: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            alert('Error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this task?')) return;
        const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setTasks(tasks.filter(t => t._id !== id));
        }
    };

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
                <Link href="/admin" style={{ color: 'var(--text-muted)', fontWeight: '700', marginBottom: '16px', display: 'inline-block' }}>
                    ← BACK TO DASHBOARD
                </Link>

                <h1 className="title" style={{ textAlign: 'left' }}>Alerts & Tasks</h1>
                <p className="subtitle" style={{ textAlign: 'left' }}>Notify students about upcoming deadlines.</p>

                <div className="stat-card" style={{ marginBottom: '40px' }}>
                    <h3 style={{ marginBottom: '16px' }}>Create New Alert</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
                        <div className="input-group">
                            <label>Title</label>
                            <input
                                className="input-field"
                                placeholder="e.g. Quiz #1"
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
                                    <option value="">Select Course...</option>
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
                            <label>Description (Optional)</label>
                            <textarea
                                className="input-field"
                                placeholder="Details..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {formData.type === 'Quiz' && (
                            <div className="input-group" style={{ background: '#e5f6fd', padding: '16px', borderRadius: '12px', border: '1px solid #1cb0f6' }}>
                                <label style={{ fontWeight: 'bold', color: '#1cb0f6' }}>Practice Quiz Questions (JSON)</label>
                                <p style={{ fontSize: '0.8rem', marginBottom: '8px', color: '#555' }}>
                                    Paste a JSON array of questions. Example:<br />
                                    <code>
                                        [{`{ "question": "Q1?", "options": ["A", "B", "C", "D"], "correctAnswer": 0 }`}]
                                    </code>
                                </p>
                                <textarea
                                    className="input-field"
                                    placeholder="Paste JSON here..."
                                    style={{ fontFamily: 'monospace', minHeight: '150px' }}
                                    value={formData.quizQuestionsJson}
                                    onChange={e => setFormData({ ...formData, quizQuestionsJson: e.target.value })}
                                />
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'POSTING...' : 'POST ALERT'}
                        </button>
                    </form>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid #e5e5e5' }}>
                    <button
                        onClick={() => setActiveTab('today')}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '12px 8px',
                            fontWeight: 'bold',
                            borderBottom: activeTab === 'today' ? '3px solid var(--primary)' : '3px solid transparent',
                            color: activeTab === 'today' ? 'var(--primary)' : 'var(--text-muted)',
                            cursor: 'pointer'
                        }}
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setActiveTab('week')}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '12px 8px',
                            fontWeight: 'bold',
                            borderBottom: activeTab === 'week' ? '3px solid var(--primary)' : '3px solid transparent',
                            color: activeTab === 'week' ? 'var(--primary)' : 'var(--text-muted)',
                            cursor: 'pointer'
                        }}
                    >
                        This Week
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '12px 8px',
                            fontWeight: 'bold',
                            borderBottom: activeTab === 'all' ? '3px solid var(--primary)' : '3px solid transparent',
                            color: activeTab === 'all' ? 'var(--primary)' : 'var(--text-muted)',
                            cursor: 'pointer'
                        }}
                    >
                        All Time ({tasks.length})
                    </button>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                    {filteredTasks.map((task, index) => (
                        // Hydration safe check: ensure date rendering is stable
                        <div key={task._id} className="stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                            <div>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ background: '#e5e5e5', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>{task.courseCode}</span>
                                    <span style={{ background: '#fff4db', color: '#ffa500', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>{task.type}</span>
                                </div>
                                <div style={{ fontWeight: '700' }}>{task.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Posted: {new Date(task.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Link
                                    href={`/admin/tasks/${task._id}`}
                                    style={{ background: '#f0f0f0', padding: '8px', borderRadius: '50%', textDecoration: 'none', fontSize: '1.2rem' }}
                                    title="Edit Task"
                                >
                                    ✏️
                                </Link>
                                <button
                                    onClick={() => handleDelete(task._id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                    title="Delete Task"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredTasks.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No tasks found in this view.</p>}
                </div>
            </div>
        </div>
    );
}

export default function CreateTask() {
    return (
        <Suspense fallback={<div className="page-container">Loading...</div>}>
            <CreateTaskContent />
        </Suspense>
    );
}
