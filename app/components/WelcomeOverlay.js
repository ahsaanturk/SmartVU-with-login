
'use client';

import { useState, useEffect } from 'react';

export default function WelcomeOverlay({ mode, onDismiss, userName }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (mode === 'back') {
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onDismiss, 500); // Wait for fade out animation
            }, 3000); // 3 seconds
            return () => clearTimeout(timer);
        }
    }, [mode, onDismiss]);

    const handleStart = () => {
        setVisible(false);
        setTimeout(onDismiss, 500);
    };

    if (!visible) return null; // Or render with opacity 0 for exit animation

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: mode === 'new' ? 'rgba(88, 204, 2, 0.95)' : 'rgba(255, 255, 255, 0.9)', // Duo Green opacity for new, White for back
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.5s ease',
            backdropFilter: 'blur(10px)'
        }}>
            {mode === 'new' ? (
                <div className="animate-pop-in" style={{ textAlign: 'center', color: 'white' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🎉</div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '16px', textShadow: '0 4px 0 rgba(0,0,0,0.2)' }}>
                        Welcome to SmartVU!
                    </h1>
                    <p style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '40px', opacity: 0.9 }}>
                        You're all set to crush your semester.
                    </p>
                    <button
                        onClick={handleStart}
                        className="btn"
                        style={{
                            background: 'white',
                            color: '#58cc02',
                            fontSize: '1.2rem',
                            padding: '20px 40px',
                            boxShadow: '0 6px 0 #ccedab', // Light green shadow
                            width: 'auto',
                            minWidth: '200px'
                        }}
                    >
                        START LEARNING
                    </button>
                </div>
            ) : (
                <div className="animate-pop-in" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }} className="bounce">👋</div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#333', marginBottom: '8px' }}>
                        Welcome back, {userName}!
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                        Ready to keep your streak alive?
                    </p>
                </div>
            )}
        </div>
    );
}
