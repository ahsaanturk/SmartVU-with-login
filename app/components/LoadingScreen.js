
'use client';

import { useState, useEffect } from 'react';

const TIPS = [
    "Did you know? Studying in short bursts is more effective!",
    "Review your notes within 24 hours to retain 80% more.",
    "Stay hydrated! Your brain needs water to focus.",
    "Sleep is when your brain cements new information.",
    "Teaching someone else is the best way to learn.",
    "Take a 5-minute break every hour.",
    "SmartVU Tip: Complete your daily streaks for bonus XP!"
];

export default function LoadingScreen() {
    const [tipIndex, setTipIndex] = useState(0);

    useEffect(() => {
        // Random start tip
        setTipIndex(Math.floor(Math.random() * TIPS.length));

        const interval = setInterval(() => {
            setTipIndex(prev => (prev + 1) % TIPS.length);
        }, 3000); // Change tip every 3 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            minHeight: '500px', // Ensure it has presence if container is collapsed
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            flex: 1 // Attempt to fill available flex space
        }}>
            {/* Bouncing Mascot */}
            <div className="bounce" style={{
                fontSize: '5rem',
                marginBottom: '24px',
                filter: 'drop-shadow(0 10px 0 #e5e5e5)'
            }}>
                🦉
            </div>

            {/* Loading Text */}
            <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: '#58cc02', // Duo Green
                marginBottom: '32px',
                letterSpacing: '1px'
            }}>
                LOADING...
            </h2>

            {/* Tip Box */}
            <div style={{
                textAlign: 'center',
                maxWidth: '400px',
                animation: 'popIn 0.5s ease'
            }}>
                <div style={{
                    fontSize: '0.9rem',
                    color: '#afafaf',
                    fontWeight: '700',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    Quick Tip
                </div>
                <div style={{
                    fontSize: '1.1rem',
                    color: '#4b4b4b',
                    fontWeight: '600',
                    lineHeight: '1.5',
                    minHeight: '60px' // Prevent layout jump
                }}>
                    "{TIPS[tipIndex]}"
                </div>
            </div>
        </div>
    );
}
