'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import LoadingScreen from '@/app/components/LoadingScreen';
import styles from './me.module.css';

export default function MePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);

    // Feedback State
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackType, setFeedbackType] = useState('General');
    const [submittingFeedback, setSubmittingFeedback] = useState(false);

    useEffect(() => {
        fetch('/api/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) setUser(data.user);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const handleToggleNotifications = async () => {
        const newState = !user.emailNotifications;
        try {
            setUser(prev => ({ ...prev, emailNotifications: newState }));
            await fetch('/api/me/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailNotifications: newState })
            });
        } catch (error) {
            setUser(prev => ({ ...prev, emailNotifications: !newState }));
        }
    };

    const handleFeedbackSubmit = async () => {
        if (!feedbackMessage.trim()) return;
        setSubmittingFeedback(true);
        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: feedbackMessage, type: feedbackType })
            });
            if (res.ok) {
                alert('Feedback sent! Thank you.');
                setShowFeedback(false);
                setFeedbackMessage('');
                setFeedbackType('General');
            } else {
                alert('Failed to send feedback.');
            }
        } catch (e) {
            alert('Error sending feedback.');
        } finally {
            setSubmittingFeedback(false);
        }
    };

    if (loading) return <LoadingScreen />;
    if (!user) return <div className="page-container">Error loading profile</div>;

    const stats = user.stats || { lessonsCompleted: 0, quizAccuracy: 0, coursesEnrolled: 0 };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '80px' }}>

            {/* Header / Hero */}
            <div className={styles.header}>
                <div className={styles.contentWrapper}>
                    <div className={styles.avatarContainer}>
                        <div className={styles.avatar}>
                            👤
                        </div>
                        {user.isVerified && (
                            <div className={styles.verifiedBadge} title="Verified Student">
                                ✅
                            </div>
                        )}
                    </div>

                    <div className={styles.userInfo}>
                        <h1 className={styles.name}>{user.name}</h1>
                        <div className={styles.email}>
                            ✉️ {user.email}
                        </div>
                        <div className={styles.joinDate}>
                            🎓 {user.degree} • Semester {user.semester}
                        </div>
                    </div>

                    <div className={styles.xpCard}>
                        <div className={styles.xpValue}>{user.xp || 0}</div>
                        <div className={styles.xpLabel}>Total XP</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

                {/* Statistics Grid */}
                <div className="stat-card">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px', color: '#333' }}>Statistics</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ border: '2px solid #e5e5e5', borderRadius: '16px', padding: '16px' }}>
                            <div style={{ fontSize: '1.5rem' }}>🔥</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{user.streakDays || 0}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700' }}>Day Streak</div>
                        </div>
                        <div style={{ border: '2px solid #e5e5e5', borderRadius: '16px', padding: '16px' }}>
                            <div style={{ fontSize: '1.5rem' }}>🎯</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{stats.quizAccuracy}%</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700' }}>Quiz Accuracy</div>
                        </div>
                        <div style={{ border: '2px solid #e5e5e5', borderRadius: '16px', padding: '16px' }}>
                            <div style={{ fontSize: '1.5rem' }}>📚</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{stats.lessonsCompleted}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700' }}>Lessons Done</div>
                        </div>
                        <div style={{ border: '2px solid #e5e5e5', borderRadius: '16px', padding: '16px' }}>
                            <div style={{ fontSize: '1.5rem' }}>🎓</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{stats.coursesEnrolled}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700' }}>Courses</div>
                        </div>
                    </div>
                </div>

                {/* Academic Details */}
                <div className="stat-card">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px', color: '#333' }}>Academic Profile</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e5e5', paddingBottom: '12px' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>University</span>
                            <span style={{ fontWeight: '700', color: '#1cb0f6' }}>{user.university}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e5e5', paddingBottom: '12px' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Degree Program</span>
                            <span style={{ fontWeight: '700' }}>{user.degree} ({user.degreeLevel})</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e5e5', paddingBottom: '12px' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Current Semester</span>
                            <span style={{ fontWeight: '700' }}>{user.semester}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e5e5', paddingBottom: '12px' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Daily Goal</span>
                            <span style={{ fontWeight: '700' }}>{user.plannedStudyTime || 60} mins</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Section */}
            <div style={{ marginTop: '32px', marginBottom: '24px' }}>
                <button
                    onClick={() => setShowSettings(true)}
                    className="btn"
                    style={{
                        background: '#f0f0f0',
                        color: '#333',
                        width: '100%',
                        fontWeight: '800',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 24px',
                        border: '2px solid #e5e5e5',
                        boxShadow: '0 4px 0 #d5d5d5'
                    }}>
                    <span>⚙️ SETTINGS</span>
                </button>

                {showSettings && (
                    <div className={styles.modalOverlay} onClick={() => setShowSettings(false)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: '#333' }}>Settings</h2>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}
                                >
                                    ✕
                                </button>
                            </div>

                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px' }}>Academic Actions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button
                                    onClick={async () => {
                                        if (!confirm('Are you sure you want to promote to the next semester? This will update your profile.')) return;
                                        try {
                                            const res = await fetch('/api/users/promote', { method: 'POST' });
                                            const data = await res.json();
                                            if (res.ok) {
                                                alert(data.message);
                                                setUser(prev => ({ ...prev, semester: data.semester }));
                                                router.refresh();
                                                setShowSettings(false);
                                            } else {
                                                alert(data.error);
                                            }
                                        } catch (e) {
                                            alert('Promotion failed. Please try again.');
                                        }
                                    }}
                                    className="btn"
                                    style={{
                                        width: '100%',
                                        background: '#f8f9fa',
                                        border: '1px solid #dee2e6',
                                        color: '#58cc02',
                                        fontWeight: '600',
                                        fontSize: '0.9rem',
                                        boxShadow: 'none'
                                    }}
                                >
                                    Promoted to next semester ({user.semester + 1}) ⬆️
                                </button>
                                <button
                                    onClick={() => router.push('/me/course-selection')}
                                    className="btn"
                                    style={{
                                        width: '100%',
                                        background: '#f8f9fa',
                                        border: '1px solid #dee2e6',
                                        color: '#333',
                                        fontWeight: '600',
                                        boxShadow: 'none'
                                    }}
                                >
                                    Course selection 📚
                                </button>
                            </div>

                            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '2px solid #e5e5e5' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px' }}>Preferences</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
                                        <div>
                                            <div style={{ fontWeight: '700' }}>Email Notifications</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Get reminders</div>
                                        </div>
                                        <button
                                            onClick={handleToggleNotifications}
                                            className={`btn ${user.emailNotifications ? 'btn-primary' : ''}`}
                                            style={{
                                                width: 'auto',
                                                padding: '8px 16px',
                                                fontSize: '0.9rem',
                                                background: user.emailNotifications ? undefined : '#e5e5e5',
                                                color: user.emailNotifications ? undefined : '#afafaf',
                                                boxShadow: user.emailNotifications ? undefined : 'none'
                                            }}
                                        >
                                            {user.emailNotifications ? 'ON' : 'OFF'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '2px solid #e5e5e5' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px' }}>Support</h3>
                                <button
                                    onClick={() => {
                                        setShowSettings(false);
                                        setShowFeedback(true);
                                    }}
                                    className="btn"
                                    style={{
                                        width: '100%',
                                        background: '#1cb0f6',
                                        color: 'white',
                                        border: 'none',
                                        boxShadow: '0 4px 0 #1899d6',
                                        fontWeight: '700'
                                    }}
                                >
                                    Give Feedback / Report Bug 🐛
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Logout Button */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <button onClick={handleLogout} className="btn" style={{ background: 'transparent', border: '2px solid #e5e5e5', color: '#afafaf', fontWeight: '700', padding: '12px 24px' }}>
                    SIGN OUT OF ACCOUNT
                </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                SmartVU Student Portal • v1.0.0
            </div>

            {/* Feedback Modal */}
            {showFeedback && (
                <div className={styles.modalOverlay} onClick={() => setShowFeedback(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '16px', color: '#333' }}>Send Feedback</h2>

                        <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#555' }}>Type</label>
                        <select
                            className={styles.selectInput}
                            value={feedbackType}
                            onChange={(e) => setFeedbackType(e.target.value)}
                        >
                            <option value="General">General Feedback</option>
                            <option value="Bug">Report a Bug</option>
                            <option value="Feature Request">Request a Feature</option>
                        </select>

                        <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#555' }}>Message</label>
                        <textarea
                            className={styles.textArea}
                            placeholder="Tell us what you think..."
                            value={feedbackMessage}
                            onChange={(e) => setFeedbackMessage(e.target.value)}
                            autoFocus
                        />

                        <div className={styles.modalActions}>
                            <button
                                className="btn"
                                style={{ background: '#f0f0f0', color: '#777', flex: 1, boxShadow: 'none' }}
                                onClick={() => setShowFeedback(false)}
                            >
                                CANCEL
                            </button>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                                onClick={handleFeedbackSubmit}
                                disabled={submittingFeedback}
                            >
                                {submittingFeedback ? 'SENDING...' : 'SEND'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
