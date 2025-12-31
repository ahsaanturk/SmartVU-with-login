
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/forgot-password/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setStep(2);
            } else {
                setError(data.error || 'Request failed');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/forgot-password/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccessMessage('Password reset successfully. Redirecting to login...');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setError(data.error || 'Reset failed');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="auth-card animate-pop-in">

                {step === 1 && (
                    <div>
                        <h2 className="title">Forgot Password?</h2>
                        <p className="subtitle">Enter your email to receive a code.</p>
                        <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <input
                                type="email"
                                placeholder="email@example.com"
                                className="input-field"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                            {error && <p style={{ color: 'var(--error)', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'SENDING...' : 'SEND OTP'}
                            </button>
                        </form>
                    </div>
                )}

                {step === 2 && !successMessage && (
                    <div>
                        <h2 className="title">New Password</h2>
                        <p className="subtitle">Check your email for the code.</p>
                        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <input
                                type="text"
                                placeholder="OTP Code"
                                className="input-field"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                maxLength={6}
                                style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem' }}
                            />
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="New Password"
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
                                    {showPassword ? '🙉' : '🙈'}
                                </button>
                            </div>
                            {error && <p style={{ color: 'var(--error)', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'RESETTING...' : 'RESET PASSWORD'}
                            </button>
                        </form>
                    </div>
                )}

                {successMessage && (
                    <div className="animate-pop-in" style={{ textAlign: 'center' }}>
                        <h2 className="title" style={{ color: 'var(--primary)' }}>Success!</h2>
                        <p className="subtitle">{successMessage}</p>
                    </div>
                )}

                <div style={{ marginTop: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '700' }}>
                    Remembered it? <Link href="/login" className="link">SIGN IN</Link>
                </div>
            </div>
        </div>
    );
}
