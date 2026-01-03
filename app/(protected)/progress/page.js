
'use client';

import { useState, useEffect } from 'react';

export default function ProgressPage() {
    const [leaderboard, setLeaderboard] = useState({ weekly: [], semester: [] });
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState('weekly');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch User Data for Streak
        fetch('/api/me').then(res => res.json()).then(data => setUserData(data.user));

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
            <div className="stat-card streak-card" style={{
                textAlign: 'center',
                marginBottom: '32px',
                padding: '40px',
                // Dynamic Background
                background: (() => {
                    const today = new Date();
                    const isCompleted = userData?.streakHistory?.some(d => {
                        const date = new Date(d);
                        return date.getDate() === today.getDate() &&
                            date.getMonth() === today.getMonth() &&
                            date.getFullYear() === today.getFullYear();
                    });

                    const streak = userData?.streakDays || 0;
                    const isMilestone = streak > 0 && streak % 7 === 0;

                    if (isCompleted) {
                        if (isMilestone) return 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)'; // Gold for milestone
                        return 'linear-gradient(135deg, #ff9600 0%, #ff5e00 100%)'; // Orange for done
                    }
                    return 'white'; // White for incomplete
                })(),
                color: (() => {
                    const today = new Date();
                    const isCompleted = userData?.streakHistory?.some(d => {
                        const date = new Date(d);
                        return date.getDate() === today.getDate() &&
                            date.getMonth() === today.getMonth() &&
                            date.getFullYear() === today.getFullYear();
                    });
                    return isCompleted ? 'white' : 'black';
                })(),
                border: (() => {
                    const today = new Date();
                    const isCompleted = userData?.streakHistory?.some(d => {
                        const date = new Date(d);
                        return date.getDate() === today.getDate() &&
                            date.getMonth() === today.getMonth() &&
                            date.getFullYear() === today.getFullYear();
                    });
                    return isCompleted ? 'none' : '2px solid #e5e5e5';
                })(),
                transition: 'all 0.3s ease'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '8px' }}>
                    {(() => {
                        const streak = userData?.streakDays || 0;
                        if (streak > 0 && streak % 7 === 0) return '🎉';
                        return '🔥';
                    })()}
                </div>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0' }}>{userData?.streakDays || 0}</h1>
                <p style={{ fontSize: '1.2rem', fontWeight: '600', opacity: 0.9 }}>Day Streak</p>

                {/* Week Streak View */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
                    {(() => {
                        const streak = userData?.streakDays || 0;
                        const today = new Date();
                        const history = userData?.streakHistory || [];

                        // Window Calculation Logic
                        // If streak < 7: Window starts from (Today - streak). "Filling up" view.
                        // If streak >= 7: Window ends at Today. "Rolling" view.

                        let startDate = new Date();
                        const isTodayComplete = history.some(d => {
                            const date = new Date(d);
                            return date.getDate() === today.getDate() &&
                                date.getMonth() === today.getMonth() &&
                                date.getFullYear() === today.getFullYear();
                        });

                        // Calculate "effective visual streak depth" to position the start
                        // If today is NOT complete, streak is X. We want the next bubble (X+1) to be Today.
                        // If today IS complete, streak is X. Today is bubble X.

                        let offset = 0;
                        if (streak < 7) {
                            if (isTodayComplete) {
                                // Streak is 1. Today is index 0. Start = Today.
                                // Streak is 2. Today is index 1. Start = Today - 1.
                                // Offset = streak - 1.
                                offset = Math.max(0, streak - 1);
                            } else {
                                // Streak is 0. Today is index 0. Start = Today.
                                // Streak is 1 (yesterday). Today is index 1. Start = Today - 1.
                                offset = streak;
                            }
                        } else {
                            // Rolling window: Today is always at the end (index 6)
                            offset = 6;
                        }

                        startDate.setDate(today.getDate() - offset);

                        // Generate 7 days from start date
                        const days = [];
                        for (let i = 0; i < 7; i++) {
                            const d = new Date(startDate);
                            d.setDate(startDate.getDate() + i);
                            days.push(d);
                        }

                        return days.map((dateObj, idx) => {
                            const isSameDay = (d1, d2) =>
                                d1.getDate() === d2.getDate() &&
                                d1.getMonth() === d2.getMonth() &&
                                d1.getFullYear() === d2.getFullYear();

                            const isDayCompleted = history.some(h => isSameDay(new Date(h), dateObj));
                            const isToday = isSameDay(dateObj, today);
                            const isFuture = dateObj > today && !isSameDay(dateObj, today);

                            // Visuals
                            let bgColor = isTodayComplete ? 'rgba(255,255,255,0.2)' : '#e5e5e5'; // Default empty
                            let textColor = isTodayComplete ? 'rgba(255,255,255,0.7)' : '#afafaf';
                            let flameColor = 'transparent';
                            let border = '2px solid transparent';
                            let scale = 1;

                            if (isDayCompleted) {
                                bgColor = isTodayComplete ? 'white' : '#ff9600';
                                flameColor = isTodayComplete ? '#ff9600' : 'white';
                                textColor = isTodayComplete ? 'white' : 'black'; // Label color logic? 
                                // Actually, if background is white, label is black. If background is Orange, label is white.
                            }

                            // Special case: Today, but incomplete
                            if (isToday && !isDayCompleted) {
                                bgColor = 'transparent';
                                border = isTodayComplete ? '2px solid rgba(255,255,255,0.5)' : '2px solid #e5e5e5';
                                flameColor = '#e5e5e5';
                            }

                            // Big Bubble Logic: 7th day of the WINDOW? Or 7th day of STREAK?
                            // User: "7th day streak will become big".
                            // We are rendering a window. We need to know if THIS DAY represents a multiple of 7 in the streak count.
                            // Complex to track exact "day number" of each past date.
                            // Simplification: In the Rolling Window (streak >= 7), the LAST bubble (index 6) is the "Big One" if streak % 7 == 0.
                            // In the Filling Window (streak < 7), the 7th bubble is Big... but we might not interpret it easily.
                            // Let's just make the TODAY bubble big if it's a milestone.

                            let isBig = false;
                            if (isToday && streak > 0 && streak % 7 === 0 && isDayCompleted) {
                                isBig = true;
                                scale = 1.3;
                            }

                            return (
                                <div key={idx} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    opacity: isFuture ? 0.3 : 1,
                                    transform: `scale(${scale})`,
                                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                }}>
                                    <p style={{
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        marginBottom: '4px',
                                        color: isTodayComplete ? 'rgba(255,255,255,0.9)' : '#777'
                                    }}>
                                        {dateObj.toLocaleDateString('en-US', { weekday: 'narrow' })}
                                    </p>
                                    <div style={{
                                        width: '40px', height: '40px',
                                        borderRadius: '50%',
                                        background: bgColor,
                                        border: border,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.2rem',
                                        color: flameColor,
                                        boxShadow: isBig ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
                                    }}>
                                        {isDayCompleted ? '🔥' : ''}
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>

                <p style={{ fontSize: '0.9rem', marginTop: '24px', opacity: 0.9 }}>
                    {(() => {
                        const today = new Date();
                        const isCompleted = userData?.streakHistory?.some(d => {
                            const date = new Date(d);
                            return date.getDate() === today.getDate() &&
                                date.getMonth() === today.getMonth() &&
                                date.getFullYear() === today.getFullYear();
                        });
                        return isCompleted
                            ? 'Streak safe! Come back tomorrow.'
                            : '🔥 Pass today’s lecture final quiz to keep your streak alive!'
                    })()}
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
