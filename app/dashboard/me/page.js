
'use client';

export default function MePage() {
    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 className="title" style={{ marginBottom: '40px' }}>My Profile</h1>

            <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                    👤
                </div>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Student Name</h2>
                    <p style={{ color: 'var(--text-muted)' }}>BSCS • Semester 1</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🇵🇰</span>
                        <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Joined Dec 2025</span>
                    </div>
                </div>
            </div>

            <div className="stat-card">
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px' }}>Settings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e5e5e5' }}>
                        <span style={{ fontWeight: '700' }}>Email Notifications</span>
                        <button className="btn btn-primary" style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}>ON</button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e5e5e5' }}>
                        <span style={{ fontWeight: '700' }}>Sound Effects</span>
                        <button className="btn btn-primary" style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', background: '#e5e5e5', color: '#afafaf', boxShadow: 'none' }}>OFF</button>
                    </div>
                    <button className="btn btn-primary" style={{ marginTop: '20px', background: '#ea2b2b', boxShadow: '0 4px 0 #a60000' }}>
                        SIGN OUT
                    </button>
                </div>
            </div>
        </div>
    );
}
