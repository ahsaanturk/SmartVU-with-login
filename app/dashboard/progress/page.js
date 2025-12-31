
'use client';

export default function ProgressPage() {
    return (
        <div>
            <h1 className="title" style={{ textAlign: 'left', marginBottom: '32px' }}>Your Progress</h1>

            {/* Weekly Chart */}
            <div className="stat-card" style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px' }}>Weekly Activity</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', paddingBottom: '10px' }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                        const height = Math.random() * 100 + 20 + '%'; // Mock data
                        return (
                            <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
                                <div style={{
                                    width: '40px',
                                    height: height,
                                    background: i === 4 ? 'var(--primary)' : '#e5e5e5',
                                    borderRadius: '8px',
                                    transition: 'height 1s ease'
                                }} />
                                <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>{day}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div className="stat-card">
                    <h4 style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Tasks Completed</h4>
                    <p style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ff9600' }}>12</p>
                    <p style={{ color: 'var(--text-muted)' }}>Past 7 Days</p>
                </div>

                <div className="stat-card">
                    <h4 style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Study Hours</h4>
                    <p style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1cb0f6' }}>8.5</p>
                    <p style={{ color: 'var(--text-muted)' }}>Goal: 10h/week</p>
                </div>

                <div className="stat-card">
                    <h4 style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Accuracy</h4>
                    <p style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ce82ff' }}>94%</p>
                    <p style={{ color: 'var(--text-muted)' }}>Quiz Average</p>
                </div>
            </div>
        </div>
    );
}
