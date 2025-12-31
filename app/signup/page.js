
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        otp: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Handlers for each step
    const handleNameSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return setError('Please enter your name');
        setError('');
        setStep(2);
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email.trim()) return setError('Please enter your email');
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, name: formData.name }),
            });
            const data = await res.json();
            if (res.ok) {
                setStep(3);
            } else {
                setError(data.error || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        if (!formData.otp.trim()) return setError('Please enter the OTP');
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp: formData.otp }),
            });
            const data = await res.json();
            if (res.ok) {
                setStep(4);
            } else {
                setError(data.error || 'Invalid OTP');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!formData.password.trim()) return setError('Please set a password');
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, password: formData.password }),
            });
            const data = await res.json();
            if (res.ok) {
                router.push('/');
                router.refresh();
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="page-container">
            <div className="auth-card animate-pop-in">
                <div className="progress-container">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className={`progress-bar ${s <= step ? 'active' : ''}`} />
                    ))}
                </div>

                {step === 1 && (
                    <div>
                        <h2 className="title">Get started</h2>
                        <p className="subtitle">What should we call you?</p>
                        <form onSubmit={handleNameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <input name="name" type="text" placeholder="Your Name" className="input-field" value={formData.name} onChange={handleChange} autoFocus />
                            {error && <p style={{ color: 'var(--error)', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
                            <button type="submit" className="btn btn-primary">CONTINUE</button>
                        </form>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h2 className="title">Hi, {formData.name}</h2>
                        <p className="subtitle">What's your email address?</p>
                        <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <input name="email" type="email" placeholder="email@example.com" className="input-field" value={formData.email} onChange={handleChange} autoFocus />
                            {error && <p style={{ color: 'var(--error)', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
                            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'SENDING...' : 'CONTINUE'}</button>
                        </form>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h2 className="title">Check your inbox</h2>
                        <p className="subtitle">We sent a code to {formData.email}</p>
                        <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <input name="otp" type="text" placeholder="000000" className="input-field" style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '1.5rem' }} value={formData.otp} onChange={handleChange} maxLength={6} autoFocus />
                            {error && <p style={{ color: 'var(--error)', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
                            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'VERIFYING...' : 'CHECK CODE'}</button>
                        </form>
                    </div>
                )}

                {step === 4 && (
                    <div>
                        <h2 className="title">Secure account</h2>
                        <p className="subtitle">Pick a strong password</p>
                        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ position: 'relative' }}>
                                <input name="password" type={showPassword ? "text" : "password"} placeholder="Password" className="input-field" value={formData.password} onChange={handleChange} autoFocus style={{ paddingRight: '48px' }} />
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
                            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'CREATING...' : 'CREATE ACCOUNT'}</button>
                        </form>
                    </div>
                )}

                <div style={{ marginTop: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '700' }}>
                    Have an account? <Link href="/login" className="link">SIGN IN</Link>
                </div>
            </div>
        </div>
    );
}
