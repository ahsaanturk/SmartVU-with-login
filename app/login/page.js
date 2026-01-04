
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/?welcome=back');
                router.refresh();
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="auth-card animate-pop-in">
                <h2 className="title">Welcome Back</h2>
                <p className="subtitle">Login to practice.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group" style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ paddingRight: '48px' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                color: '#afafaf',
                                cursor: 'pointer',
                                fontSize: '1.2rem'
                            }}
                        >
                            {showPassword ? 'NO' : 'YES'}
                            {/* Replaced generic emoji with rough text representation or we stick to emoji but lighter color */}
                            {showPassword ? '🙉' : '🙈'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-10px', marginBottom: '10px' }}>
                        <Link href="/forgot-password" style={{ color: '#afafaf', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Forgot Password?
                        </Link>
                    </div>

                    {error && <p style={{ color: 'var(--error)', fontSize: '0.9rem', textAlign: 'center', fontWeight: '700' }}>{error}</p>}

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'WAIT...' : 'LOG IN'}
                    </button>
                </form>

                <div style={{ marginTop: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '700' }}>
                    New here? <Link href="/signup" className="link">CREATE ACCOUNT</Link>
                </div>
            </div>
        </div>
    );
}
