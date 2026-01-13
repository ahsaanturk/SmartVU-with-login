'use client';

import { useState, useEffect } from 'react';
import LoadingScreen from '@/app/components/LoadingScreen';
import styles from './progress.module.css';

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

    if (loading) return <LoadingScreen />;

    // --- Streak Logic Helper ---
    const getStreakStatus = () => {
        if (!userData) return 'inactive';

        const today = new Date();
        const history = userData.streakHistory || [];
        const streak = userData.streakDays || 0;

        const isCompleted = history.some(d => {
            const date = new Date(d);
            return date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
        });

        const isMilestone = streak > 0 && streak % 7 === 0;

        if (isCompleted) return isMilestone ? 'milestone' : 'active';
        return 'inactive';
    };

    const status = getStreakStatus();
    const streak = userData?.streakDays || 0;
    const list = activeTab === 'weekly' ? leaderboard.weekly : leaderboard.semester;

    return (
        <div className={styles.container}>
            {/* Streak Section */}
            <div className={styles.streakCard} data-status={status}>
                <div className={styles.fireIcon}>
                    {streak > 0 && streak % 7 === 0 ? '🎉' : '🔥'}
                </div>
                <h1 className={styles.streakCount}>{streak}</h1>
                <p className={styles.streakLabel}>Day Streak</p>

                {/* Week Streak View */}
                <div className={styles.weekContainer}>
                    {(() => {
                        const today = new Date();
                        const history = userData?.streakHistory || [];
                        const isTodayComplete = status !== 'inactive';

                        // Logic to calculate start date of the window
                        let offset = 0;
                        if (streak < 7) {
                            offset = isTodayComplete ? Math.max(0, streak - 1) : streak;
                        } else {
                            offset = 6; // Rolling window
                        }

                        let startDate = new Date();
                        startDate.setDate(today.getDate() - offset);

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

                            // Milestone Logic
                            const isBig = isToday && streak > 0 && streak % 7 === 0 && isDayCompleted;

                            // Flame Color Logic (Context dependent)
                            let flameColor = 'transparent';
                            if (isDayCompleted) {
                                if (status === 'inactive') flameColor = 'white'; // Inside orange bubble
                                else flameColor = (status === 'milestone') ? '#ffd700' : '#ff9600'; // Inside white bubble
                            }

                            return (
                                <div key={idx} className={styles.dayItem} style={{ opacity: isFuture ? 0.3 : 1 }}>
                                    <p className={styles.dayLabel} style={{
                                        color: status === 'inactive' ? '#777' : 'rgba(255,255,255,0.9)'
                                    }}>
                                        {dateObj.toLocaleDateString('en-US', { weekday: 'narrow' })}
                                    </p>

                                    <div className={`${styles.bubble} ${isDayCompleted ? styles.completed : ''} ${isToday ? styles.today : ''} ${isBig ? styles.big : ''}`}>
                                        <span style={{ color: flameColor }}>{isDayCompleted ? '🔥' : ''}</span>
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>

                <p className={styles.motivationText}>
                    {status !== 'inactive'
                        ? 'Streak safe! Come back tomorrow.'
                        : '🔥 Pass today’s lecture final quiz to keep your streak alive!'}
                </p>
            </div>

            {/* Leaderboard Section */}
            <div>
                <div className={styles.leaderboardHeader}>
                    <button
                        onClick={() => setActiveTab('weekly')}
                        className={`${styles.tabBtn} ${activeTab === 'weekly' ? styles.activeWeekly : ''}`}
                    >
                        WEEKLY TOP 50
                    </button>
                    <button
                        onClick={() => setActiveTab('semester')}
                        className={`${styles.tabBtn} ${activeTab === 'semester' ? styles.activeSemester : ''}`}
                    >
                        SEMESTER LEADERS
                    </button>
                </div>

                <div className="animate-pop-in">
                    {list.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>No leaders yet.</p>
                    ) : (
                        list.map((user, index) => (
                            <div key={user._id} className={`${styles.leaderRow} ${user._id === userData?._id ? styles.isMe : ''}`}>
                                <div className={styles.rankBadge}>
                                    {index + 1}
                                </div>
                                <div className={styles.userName}>
                                    {user.name}
                                    {user._id === userData?._id && <span className={styles.youTag}>YOU</span>}
                                </div>
                                <div className={`${styles.xpCount} ${activeTab === 'weekly' ? styles.xpWeekly : styles.xpSemester}`}>
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
