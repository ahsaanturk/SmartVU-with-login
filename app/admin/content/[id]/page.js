
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditContentPage({ params }) {
    const router = useRouter();
    const { id } = use(params);

    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        type: 'Lecture',
        title: '',
        description: '',
        content: '',
        resourceLink: '',
        courseCode: '',
        author: '',
        university: 'Virtual University'
    });

    useEffect(() => {
        fetch(`/api/admin/content/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.content) {
                    setFormData(data.content);
                }
                setLoading(false);
            });
    }, [id]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch(`/api/admin/content/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            alert('Content Updated');
            router.push('/admin/content');
        } else {
            alert('Update Failed');
        }
    };

    if (loading) return <div className="page-container">Loading...</div>;

    const type = formData.type;

    return (
        <div className="page-container">
            <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                <Link href="/admin/content" style={{ color: 'var(--text-muted)', fontWeight: '700', marginBottom: '16px', display: 'inline-block' }}>
                    ← BACK TO LIBRARY
                </Link>
                <h1 className="title">Edit {type}</h1>

                <div className="stat-card glass-panel">
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>

                        {/* Course Code (if applicable) */}
                        {type !== 'Quote' && (
                            <div className="input-group">
                                <label>Course Code</label>
                                <input
                                    className="input-field"
                                    name="courseCode"
                                    value={formData.courseCode || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        )}

                        {/* Fields based on Type - Simplified for Edit */}
                        {type === 'Quote' && (
                            <>
                                <div className="input-group">
                                    <label>Quote Text</label>
                                    <input name="description" className="input-field" value={formData.description} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Author</label>
                                    <input name="author" className="input-field" value={formData.author} onChange={handleChange} required />
                                </div>
                            </>
                        )}

                        {type === 'Concept' && (
                            <>
                                <div className="input-group">
                                    <label>Title</label>
                                    <input name="title" className="input-field" value={formData.title} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Description</label>
                                    <textarea name="description" className="input-field" style={{ minHeight: '100px' }} value={formData.description} onChange={handleChange} required />
                                </div>
                            </>
                        )}

                        {(type === 'Lecture' || type === 'Handout') && (
                            <>
                                <div className="input-group">
                                    <label>Title</label>
                                    <input name="title" className="input-field" value={formData.title} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Resource URL</label>
                                    <input name="resourceLink" className="input-field" value={formData.resourceLink} onChange={handleChange} required />
                                </div>
                            </>
                        )}

                        {/* Generic description field if not covered above but present */}
                        {/* We handle most types. Quiz edit is complex (json), let's skip deep JSON edit for MVP or add raw JSON editor */}
                        {type === 'Quiz' && (
                            <div>
                                <p>Quiz Editing is currently limited to deletions/re-upload or raw JSON if implemented. For now, you can edit metadata.</p>
                                <div className="input-group">
                                    <label>Title</label>
                                    <input name="title" className="input-field" value={formData.title} onChange={handleChange} />
                                </div>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
                            UPDATE CONTENT
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
