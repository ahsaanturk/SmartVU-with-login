'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './alerts.module.css';

import { useSearchParams } from 'next/navigation';

import LoadingScreen from '@/app/components/LoadingScreen';

export default function AlertsPage() {
    const searchParams = useSearchParams();
    // Default to 'Pending', but if URL has filter, use that immediately.
    const initialFilter = searchParams.get('filter') && ['Pending', 'Missed', 'Completed'].includes(searchParams.get('filter'))
        ? searchParams.get('filter')
        : 'Pending';

    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState(initialFilter);
    const [loading, setLoading] = useState(false);
    const [expandedTasks, setExpandedTasks] = useState({});

    // Delete Modal State
    const [taskToDelete, setTaskToDelete] = useState(null);

    // Sync state if URL param changes
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

    const handleDeleteClick = (task) => {
        setTaskToDelete(task);
    };

    const confirmDelete = async () => {
        if (!taskToDelete) return;
        try {
            const res = await fetch('/api/tasks/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId: taskToDelete._id })
            });

            if (res.ok) {
                setTasks(prev => prev.filter(t => t._id !== taskToDelete._id));
                setTaskToDelete(null);
            } else {
                alert('Failed to delete task');
            }
        } catch (e) {
            alert('Error deleting task');
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Alerts & Tasks</h1>
                <div className={styles.tabs}>
                    {['Pending', 'Missed', 'Completed'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`${styles.tabBtn} ${filter === tab ? styles.tabBtnActive : ''} ${filter === tab ? styles['tabBtnActive' + tab] : ''}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="animate-pop-in">
                {tasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
                        <h3>No {filter.toLowerCase()} tasks!</h3>
                    </div>
                ) : (
                    <div className={styles.taskList}>
                        {tasks.map(task => (
                            <div key={task._id} className={styles.taskCard}>
                                <div className={styles.taskInfo}>
                                    <span className={styles.courseTag}>{task.courseCode}</span>
                                    <h4 className={styles.taskTitle}>{task.title}</h4>
                                    <p className={styles.dueDate}>Due: {new Date(task.dueDate).toLocaleDateString()}</p>

                                    {task.description && expandedTasks[task._id] && (
                                        <div className={`animate-pop-in ${styles.instructions}`}>
                                            {task.description}
                                        </div>
                                    )}
                                </div>

                                <div className={styles.actions}>
                                    {filter === 'Pending' && (
                                        <>
                                            {task.type === 'Quiz' && (
                                                <Link href={`/learning/practice/${task._id}`} className={`${styles.miniBtn} ${styles.btnPractice}`}>
                                                    <span>📝</span> PRACTICE
                                                </Link>
                                            )}
                                            <button onClick={() => handleCompleteTask(task._id)} className={`${styles.miniBtn} ${styles.btnDone}`}>
                                                <span>✓</span> DONE
                                            </button>
                                        </>
                                    )}
                                    {filter === 'Missed' && (
                                        <>
                                            <button onClick={() => handleEmailInstructor(task)} className={`${styles.miniBtn} ${styles.btnEmail}`}>
                                                <span>✉️</span> EMAIL
                                            </button>
                                            <button onClick={() => handleDeleteClick(task)} className={`${styles.miniBtn} ${styles.btnDelete}`}>
                                                <span>🗑️</span>
                                            </button>
                                        </>
                                    )}
                                    {filter === 'Completed' && (
                                        <>
                                            <span className={styles.completedIcon}>✅</span>
                                            <button onClick={() => handleDeleteClick(task)} className={`${styles.miniBtn} ${styles.btnDelete}`} style={{ width: 'auto', padding: '8px' }}>
                                                <span>🗑️</span>
                                            </button>
                                        </>
                                    )}
                                </div>

                                {task.description && (
                                    <button
                                        onClick={() => toggleExpand(task._id)}
                                        className={styles.btnExpand}
                                        title="View Instructions"
                                    >
                                        {expandedTasks[task._id] ? '−' : '+'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {taskToDelete && (
                <div className={styles.modalOverlay} onClick={() => setTaskToDelete(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🗑️</div>
                        <h3 className={styles.modalTitle}>Delete this task?</h3>
                        <p className={styles.modalText}>
                            Are you sure you want to remove <strong>{taskToDelete.title}</strong>? This action cannot be undone.
                        </p>
                        <div className={styles.modalActions}>
                            <button className={`${styles.btnModal} ${styles.btnCancel}`} onClick={() => setTaskToDelete(null)}>
                                CANCEL
                            </button>
                            <button className={`${styles.btnModal} ${styles.btnConfirm}`} onClick={confirmDelete}>
                                DELETE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
