
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateUserPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        degree: 'BSCS',
        semester: 1,
        role: 'student'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push('/admin/users');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create user');
            }
        } catch (error) {
            alert('Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <Link href="/admin/users" style={{ color: 'var(--text-muted)', fontWeight: '700', marginBottom: '16px', display: 'inline-block' }}>
                    ← BACK TO USERS
                </Link>
                <h1 className="title">Create User</h1>

                <div className="stat-card">
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input
                                className="input-field"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Email</label>
                            <input
                                type="email"
                                className="input-field"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="Min 6 chars"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="input-group">
                                <label>Degree</label>
                                <select
                                    className="input-field"
                                    value={formData.degree}
                                    onChange={e => setFormData({ ...formData, degree: e.target.value })}
                                >
                                    <option value="BSCS">BSCS</option>
                                    <option value="BSIT">BSIT</option>
                                    <option value="BSSE">BSSE</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Semester</label>
                                <input
                                    type="number"
                                    min="1" max="8"
                                    className="input-field"
                                    value={formData.semester}
                                    onChange={e => setFormData({ ...formData, semester: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Role</label>
                            <select
                                className="input-field"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="student">Student</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'CREATING...' : 'CREATE USER'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
