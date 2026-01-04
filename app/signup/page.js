
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        university: 'Virtual University',
        degreeLevel: 'BS',
        degree: 'BSCS',
        semester: 1,
        email: '',
        otp: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Handlers
    const handleNameSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return setError('Please enter your name');
        setError('');
        setStep(2);
    };

    const handleAcademicSubmit = (e) => {
        e.preventDefault();
        // Validation if needed
        setStep(3);
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
                setStep(4);
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
                setStep(5);
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
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    university: formData.university,
                    degreeLevel: formData.degreeLevel,
                    degree: formData.degree,
                    semester: formData.semester
                }),
            });
            const data = await res.json();
            if (res.ok) {
                router.push('/?welcome=new');
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
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className={`progress-bar ${s <= step ? 'active' : ''}`} style={{ width: '100%', maxWidth: '40px' }} />
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
                        <h2 className="title">Academic Info</h2>
                        <p className="subtitle">Tell us about your study program.</p>
                        <form onSubmit={handleAcademicSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                            <div className="input-group">
                                <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>University</label>
                                <input name="university" type="text" className="input-field" value={formData.university} disabled style={{ background: '#e5e5e5', color: '#777' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Class</label>
                                    <input name="degreeLevel" type="text" className="input-field" value={formData.degreeLevel} disabled style={{ background: '#e5e5e5', color: '#777' }} />
                                </div>
                                <div style={{ flex: 2 }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Field</label>
                                    <select name="degree" className="input-field" value={formData.degree} onChange={handleChange}>
                                        <option value="BSCS">BSCS</option>
                                        <option value="BSIT">BSIT</option>
                                        <option value="BSSE">BSSE</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Semester</label>
                                <select name="semester" className="input-field" value={formData.semester} onChange={handleChange}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                        <option key={sem} value={sem}>Semester {sem}</option>
                                    ))}
                                </select>
                            </div>

                            <button type="submit" className="btn btn-primary">CONTINUE</button>
                        </form>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h2 className="title">Hi, {formData.name}</h2>
                        <p className="subtitle">What's your email address?</p>
                        <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <input name="email" type="email" placeholder="bc123456789@vu.edu.pk" className="input-field" value={formData.email} onChange={handleChange} autoFocus />
                            {error && <p style={{ color: 'var(--error)', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
                            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'SENDING...' : 'CONTINUE'}</button>
                        </form>
                    </div>
                )}

                {step === 4 && (
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

                {step === 5 && (
                    <div>
                        <h2 className="title">Secure account</h2>
                        <p className="subtitle">Pick a strong password</p>
                        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="input-group" style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: 'var(--input-bg)',
                                border: '2px solid #e5e5e5',
                                borderRadius: '16px',
                                paddingRight: '10px'
                            }}>
                                <input name="password" type={showPassword ? "text" : "password"} placeholder="Password" className="input-field" value={formData.password} onChange={handleChange} autoFocus style={{ border: 'none', background: 'transparent', flex: 1, boxShadow: 'none' }} />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#afafaf',
                                        cursor: 'pointer',
                                        fontSize: '1.2rem',
                                        padding: '8px'
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
