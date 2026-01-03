
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = (query = '') => {
        setLoading(true);
        fetch(`/api/admin/users?q=${query}`)
            .then(res => res.json())
            .then(data => {
                setUsers(data.users || []);
                setLoading(false);
            });
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure? This cannot be undone.')) return;

        const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setUsers(users.filter(u => u._id !== id));
        } else {
            alert('Failed to delete user');
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        // Debounce could be here
        if (e.key === 'Enter') fetchUsers(e.target.value);
    };

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="title">Users</h1>
                    <p className="subtitle">Manage student accounts.</p>
                </div>
                <Link href="/admin/users/create" className="btn btn-primary" style={{ width: 'auto' }}>
                    + NEW STUDENT
                </Link>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <input
                    placeholder="Search by name or email..."
                    className="input-field"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchUsers(search)}
                    style={{ maxWidth: '400px' }}
                />
            </div>

            {loading ? <p>Loading...</p> : (
                <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f7f7f7', borderBottom: '2px solid #e5e5e5' }}>
                            <tr>
                                <th style={{ padding: '16px' }}>Name</th>
                                <th style={{ padding: '16px' }}>Email</th>
                                <th style={{ padding: '16px' }}>Degree</th>
                                <th style={{ padding: '16px' }}>Role</th>
                                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                                    <td style={{ padding: '16px', fontWeight: '700' }}>{user.name}</td>
                                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{user.email}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            background: '#ddf4ff', color: '#1cb0f6',
                                            padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700'
                                        }}>
                                            {user.degree} {user.semester && `Sem ${user.semester}`}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>{user.role}</td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <Link href={`/admin/users/${user._id}`} style={{ marginRight: '16px', fontSize: '1.2rem', textDecoration: 'none' }} title="Edit User">
                                            ✏️
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(user._id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                            title="Delete User"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
