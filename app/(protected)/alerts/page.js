
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { useSearchParams } from 'next/navigation';

import LoadingScreen from '@/app/components/LoadingScreen';

export default function AlertsPage() {
    const searchParams = useSearchParams();
    // Default to 'Pending', but if URL has filter, use that immediately.
    // This avoids the double-fetch race condition.
    const initialFilter = searchParams.get('filter') && ['Pending', 'Missed', 'Completed'].includes(searchParams.get('filter'))
        ? searchParams.get('filter')
        : 'Pending';

    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState(initialFilter);
    const [loading, setLoading] = useState(false);
    const [expandedTasks, setExpandedTasks] = useState({});

    // Sync state if URL param changes (e.g. back button)
    useEffect(() => {
        const param = searchParams.get('filter');
        if (param && ['Pending', 'Missed', 'Completed'].includes(param)) {
            setFilter(param);
        }
    }, [searchParams]);

    useEffect(() => {
        let ignore = false;
        setLoading(true);

        fetch(`/api/tasks?status=${filter}`)
            .then(res => res.json())
            .then(data => {
                if (!ignore) {
                    setTasks(data.tasks || []);
                }
            })
            .catch(() => {
                if (!ignore) setTasks([]);
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });

        return () => { ignore = true; };
    }, [filter]);

    const toggleExpand = (id) => {
        setExpandedTasks(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleEmailInstructor = async (task) => {
        const message = prompt('Draft your email to the instructor:', `Dear Instructor,\n\nI missed the deadline for ${task.title} due to...`);
        if (!message) return;

        try {
            const res = await fetch('/api/instructor/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: task.title,
                    message,
                    courseCode: task.courseCode
                })
            });
            if (res.ok) alert('Email sent successfully!');
        } catch (e) {
            alert('Failed to send email.');
        }
    };

    const handleCompleteTask = async (taskId) => {
        try {
            const res = await fetch('/api/tasks/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId })
            });
            if (res.ok) {
                setTasks(prev => prev.filter(t => t._id !== taskId));
                alert('Task marked as complete! Streak updated.');
            }
        } catch (e) {
            alert('Error');
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div>
            <h1 className="title" style={{ textAlign: 'left', marginBottom: '32px' }}>Alerts & Tasks</h1>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '2px solid #e5e5e5' }}>
                {['Pending', 'Missed', 'Completed'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        style={{
                            background: 'none',
                            border: 'none',
                            borderBottom: filter === tab ? '4px solid #ea2b2b' : '4px solid transparent',
                            padding: '12px 24px',
                            fontSize: '1rem',
                            fontWeight: '800',
                            color: filter === tab ? '#ea2b2b' : 'var(--text-muted)',
                            cursor: 'pointer',
                            marginBottom: '-2px'
                        }}
                    >
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="animate-pop-in">
                {tasks.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No tasks found.</p> : (
                    tasks.map(task => (
                        <div key={task._id} className="task-card">
                            <div>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{
                                        background: '#e5e5e5',
                                        color: 'var(--text-muted)',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: '800'
                                    }}>
                                        {task.courseCode}
                                    </span>
                                </div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{task.title}</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {filter === 'Pending' && (
                                    <>
                                        {task.type === 'Quiz' && (
                                            <Link href={`/learning/practice/${task._id}`} className="btn btn-primary" style={{ width: 'auto', background: '#1cb0f6', boxShadow: '0 4px 0 #1899d6', textDecoration: 'none' }}>
                                                PRACTICE
                                            </Link>
                                        )}
                                        <button onClick={() => handleCompleteTask(task._id)} className="btn btn-primary" style={{ width: 'auto', background: '#58cc02', boxShadow: '0 4px 0 #46a302' }}>
                                            MARK DONE
                                        </button>
                                    </>
                                )}
                                {filter === 'Missed' && (
                                    <button onClick={() => handleEmailInstructor(task)} className="btn btn-primary" style={{ width: 'auto', background: '#1cb0f6', boxShadow: '0 4px 0 #1899d6' }}>
                                        EMAIL TEACHER
                                    </button>
                                )}
                                {filter === 'Completed' && (
                                    <span style={{ fontSize: '1.5rem' }}>✅</span>
                                )}

                                {task.description && (
                                    <button
                                        onClick={() => toggleExpand(task._id)}
                                        style={{
                                            background: '#e5e5e5',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            cursor: 'pointer',
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold',
                                            color: 'var(--text-muted)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                        title="View Instructions"
                                    >
                                        {expandedTasks[task._id] ? '−' : '+'}
                                    </button>
                                )}
                            </div>

                            {expandedTasks[task._id] && (
                                <div className="animate-pop-in" style={{ marginTop: '16px', padding: '16px', background: '#f7f7f7', borderRadius: '12px', border: '2px dashed #e5e5e5' }}>
                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>INSTRUCTIONS</h4>
                                    <p style={{ lineHeight: '1.5' }}>{task.description}</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

        </div>
    );
}
