
'use client';

import { useState, useEffect } from 'react';

export default function ProgressPage() {
    const [leaderboard, setLeaderboard] = useState({ weekly: [], semester: [] });
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState('weekly');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch User Data for Streak
        fetch('/api/auth/me').then(res => res.json()).then(data => setUserData(data.user));

        // Fetch Leaderboard
        fetch('/api/leaderboard')
            .then(res => res.json())
            .then(data => {
                setLeaderboard(data);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="page-container">Loading...</div>;

    const list = activeTab === 'weekly' ? leaderboard.weekly : leaderboard.semester;

    return (
        <div>
            {/* Streak Section */}
            <div className="stat-card" style={{ textAlign: 'center', marginBottom: '32px', padding: '40px', background: 'linear-gradient(135deg, #ff9600 0%, #ff5e00 100%)', color: 'white', border: 'none' }}>
                <div style={{ fontSize: '4rem', marginBottom: '8px' }}>🔥</div>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0' }}>{userData?.streakDays || 0}</h1>
                <p style={{ fontSize: '1.2rem', fontWeight: '600', opacity: 0.9 }}>Day Streak</p>

                {/* Week Streak View */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dayInitial, idx) => {
                        // Logic to determine status
                        const today = new Date();
                        const currentDayIdx = today.getDay(); // 0 = Sun

                        const isToday = idx === currentDayIdx;
                        const isFuture = idx > currentDayIdx;

                        // Check history
                        let isCompleted = false;
                        if (userData?.streakHistory) {
                            isCompleted = userData.streakHistory.some(dateStr => {
                                const d = new Date(dateStr);
                                // Check if this history entry is in the CURRENT week
                                // Simple check: same year, month, and date matches the target day of this week
                                // This is tricky. simpler: check if it's within last 7 days AND matches the day index?
                                // No, visual requirement is "Sun Mon ... Sat". It implies THIS calendar week.

                                // Calculate the date for this index in the current week
                                const startOfWeek = new Date(today);
                                startOfWeek.setDate(today.getDate() - currentDayIdx); // Go back to Sunday

                                const targetDate = new Date(startOfWeek);
                                targetDate.setDate(startOfWeek.getDate() + idx);

                                return d.getDate() === targetDate.getDate() &&
                                    d.getMonth() === targetDate.getMonth() &&
                                    d.getFullYear() === targetDate.getFullYear();
                            });
                        }

                        // Special case: if today is completed, isCompleted will be true.

                        let bgColor = 'rgba(255,255,255,0.2)';
                        let borderColor = 'transparent';
                        let opacity = 1;
                        let flameColor = 'rgba(255,255,255,0.5)';

                        if (isFuture) {
                            opacity = 0.5;
                        } else if (isCompleted) {
                            bgColor = 'white';
                            flameColor = '#ff9600';
                        } else if (isToday) {
                            bgColor = 'rgba(255,255,255,0.1)';
                            borderColor = 'white';
                            flameColor = 'white'; // Placeholder until completed
                        }

                        return (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>{dayInitial}</p>
                                <div style={{
                                    width: '40px', height: '40px',
                                    borderRadius: '50%',
                                    background: bgColor,
                                    border: `2px solid ${borderColor}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    color: flameColor
                                }}>
                                    🔥
                                </div>
                                {isToday && !isCompleted && (
                                    <div style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%', marginTop: '4px' }}></div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <p style={{ fontSize: '0.9rem', marginTop: '24px', opacity: 0.9 }}>
                    🔥 Pass today’s lecture final quiz to complete your streak<br />
                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>ℹ️ Practice quizzes do not affect streaks</span>
                </p>
            </div>

            {/* Leaderboard Section */}
            <div>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '2px solid #e5e5e5' }}>
                    <button
                        onClick={() => setActiveTab('weekly')}
                        style={{
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'weekly' ? '4px solid #1cb0f6' : '4px solid transparent',
                            padding: '12px 24px',
                            fontSize: '1.1rem',
                            fontWeight: '800',
                            color: activeTab === 'weekly' ? '#1cb0f6' : 'var(--text-muted)',
                            cursor: 'pointer'
                        }}
                    >
                        WEEKLY TOP 50
                    </button>
                    <button
                        onClick={() => setActiveTab('semester')}
                        style={{
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'semester' ? '4px solid #58cc02' : '4px solid transparent',
                            padding: '12px 24px',
                            fontSize: '1.1rem',
                            fontWeight: '800',
                            color: activeTab === 'semester' ? '#58cc02' : 'var(--text-muted)',
                            cursor: 'pointer'
                        }}
                    >
                        SEMESTER LEADERS
                    </button>
                </div>

                <div className="animate-pop-in">
                    {list.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No leaders yet.</p>
                    ) : (
                        list.map((user, index) => (
                            <div key={user._id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '16px',
                                marginBottom: '12px',
                                background: user._id === userData?._id ? '#e5f6fd' : 'white',
                                border: user._id === userData?._id ? '2px solid #1cb0f6' : '2px solid #e5e5e5',
                                borderRadius: '16px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: index < 3 ? '#ffbd00' : '#e5e5e5',
                                    color: index < 3 ? 'white' : 'var(--text-muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800',
                                    fontSize: '1.2rem',
                                    marginRight: '16px'
                                }}>
                                    {index + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px' }}>
                                        {user.name}
                                        {user._id === userData?._id && <span style={{ fontSize: '0.8rem', color: '#1cb0f6', marginLeft: '8px' }}>(You)</span>}
                                    </h3>
                                </div>
                                <div style={{ fontWeight: '800', color: activeTab === 'weekly' ? '#1cb0f6' : '#58cc02' }}>
                                    {activeTab === 'weekly' ? user.weeklyXP : user.xp} XP
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
