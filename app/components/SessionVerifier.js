'use client';

import { useState, useEffect } from 'react';

const TIPS = [
    "Verifying your credentials securely...",
    "Did you know? Consistent streaks boost retention!",
    "Setting up your personal learning environment...",
    "Reviewing your progress data...",
    "Almost there! Get ready to learn.",
    "SmartVU: Education made adaptive."
];

export default function SessionVerifier() {
    const [tipIndex, setTipIndex] = useState(0);

    useEffect(() => {
        // Random start tip
        setTipIndex(Math.floor(Math.random() * TIPS.length));

        const interval = setInterval(() => {
            setTipIndex(prev => (prev + 1) % TIPS.length);
        }, 2500); // Change tip every 2.5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 9999
        }}>
            {/* CSS Spinner */}
            <div className="spinner" style={{
                width: '60px',
                height: '60px',
                border: '6px solid #f3f3f3', /* Light grey */
                borderTop: '6px solid #58cc02', /* Duo Green */
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '32px'
            }}></div>

            {/* Loading Text */}
            <h2 style={{
                fontSize: '1.2rem',
                fontWeight: '800',
                color: '#58cc02', // Duo Green
                marginBottom: '40px',
                letterSpacing: '1px',
                textTransform: 'uppercase'
            }}>
                Verifying Session...
            </h2>

            {/* Tip Box */}
            <div style={{
                textAlign: 'center',
                maxWidth: '400px',
                animation: 'fadeIn 0.5s ease'
            }}>
                <div style={{
                    fontSize: '1rem',
                    color: '#4b4b4b',
                    fontWeight: '600',
                    lineHeight: '1.5',
                    minHeight: '48px',
                    fontStyle: 'italic'
                }}>
                    "{TIPS[tipIndex]}"
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
