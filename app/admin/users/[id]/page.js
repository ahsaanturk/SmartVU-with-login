
'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react'; // Next.js 15
import Link from 'next/link';

export default function EditUserPage({ params }) {
    const router = useRouter();
    // Unwrapping params in Next 15 if needed, but 'use' is experimental in some versions or standard in 15. 
    // Safest is to await or Just use 'use' hook if we are in a client component that receives promise params?
    // Actually in Next 15 params is a Promise.
    // Simplifying: Let's assume standard client component behavior or just direct access if it works, 
    // but better to use `use()` if available or `useEffect` to unwrap.
    // For now, I'll use `use(params)` pattern if I was on server, but here I can just wait for it or access.
    // Actually, let's keep it simple: `const { id } = use(params);`

    // Wait, `use` needs React import.
    const { id } = use(params);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        degree: '',
        semester: 1,
        role: ''
    });
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/admin/users/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setFormData({
                        name: data.user.name,
                        email: data.user.email,
                        degree: data.user.degree || 'BSCS',
                        semester: data.user.semester || 1,
                        role: data.user.role || 'student'
                    });
                }
                setLoading(false);
            });
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = { ...formData };
        if (password) payload.password = password;

        const res = await fetch(`/api/admin/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('User Updated');
            router.push('/admin/users');
        } else {
            alert('Update Failed');
        }
    };

    if (loading) return <div className="page-container">Loading...</div>;

    return (
        <div className="page-container" style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'flex-start',
            minHeight: 'auto'
        }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                <Link href="/admin/users" style={{ color: 'var(--text-muted)', fontWeight: '700', marginBottom: '16px', display: 'inline-block' }}>
                    ← BACK TO USERS
                </Link>
                <h1 className="title">Edit User</h1>

                <div className="stat-card glass-panel">
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
                            <label>New Password (Optional)</label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="Leave blank to keep current"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
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

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
                            SAVE CHANGES
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
