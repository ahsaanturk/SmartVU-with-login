'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UploadPage() {
    const router = useRouter();
    const [type, setType] = useState('Lecture');
    const [university, setUniversity] = useState('Virtual University');

    // Recent Courses logic
    const [recentCourses, setRecentCourses] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        author: '',
        resourceLink: '',
        courseCode: '',
        content: '',
        quizJson: ''
    });
    const [addQuiz, setAddQuiz] = useState(false);

    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Search state
    const [courseSearch, setCourseSearch] = useState('');
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('recentCourses');
        if (saved) setRecentCourses(JSON.parse(saved));

        // Fetch All Courses from DB
        fetch('/api/courses')
            .then(res => res.json())
            .then(data => setAllCourses(data.courses || []));
    }, []);

    useEffect(() => {
        if (courseSearch.trim() === '') {
            setFilteredCourses([]);
        } else {
            const matches = allCourses.filter(c =>
                c.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
                c.name.toLowerCase().includes(courseSearch.toLowerCase()) // Changed 'title' to 'name' based on DB schema
            );
            setFilteredCourses(matches.slice(0, 5)); // Limit to 5
        }
    }, [courseSearch, allCourses]);

    const selectCourse = (code) => {
        setFormData({ ...formData, courseCode: code });
        setCourseSearch(code); // Set input to code
        setShowDropdown(false);

        // Add to recent
        const newRecent = [code, ...recentCourses.filter(c => c !== code)].slice(0, 3);
        setRecentCourses(newRecent);
        localStorage.setItem('recentCourses', JSON.stringify(newRecent));
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            // 1. Upload Main Content
            const mainPayload = {
                type,
                university,
                title: formData.title,
                description: formData.description,
                author: formData.author,
                resourceLink: formData.resourceLink,
                content: formData.content,
                courseCode: formData.courseCode,
            };

            const res1 = await fetch('/api/admin/content', {
                method: 'POST',
                body: JSON.stringify(mainPayload)
            });

            if (!res1.ok) throw new Error('Failed to upload content');

            // 2. Upload Related Quiz (if checked)
            if (addQuiz && formData.quizJson) {
                let questions = [];
                try {
                    questions = JSON.parse(formData.quizJson);
                } catch (jsonErr) {
                    throw new Error('Invalid JSON format for Quiz');
                }

                const quizPayload = {
                    type: 'Quiz',
                    university,
                    title: `Quiz: ${formData.title}`,
                    courseCode: formData.courseCode,
                    questions: questions,
                    description: `Practice quiz for ${formData.title}`
                };

                const res2 = await fetch('/api/admin/content', {
                    method: 'POST',
                    body: JSON.stringify(quizPayload)
                });
                if (!res2.ok) throw new Error('Failed to upload quiz');
            }

            setMessage('Upload Successful!');
            setFormData({ title: '', description: '', author: '', resourceLink: '', courseCode: '', content: '', quizJson: '' });
            setCourseSearch('');
            setAddQuiz(false);

            // Redirect to list after short delay? Or just stay
            setTimeout(() => router.push('/admin/content'), 1000);

        } catch (err) {
            setMessage(err.message || 'Error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <Link href="/admin/content" style={{ color: 'var(--text-muted)', fontWeight: '700', marginBottom: '16px', display: 'inline-block' }}>
                    ← BACK TO CONTENT
                </Link>
                <h1 className="title">Upload Content</h1>

                <div className="stat-card">
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* University */}
                        <div>
                            <label className="label">University</label>
                            <select
                                value={university}
                                onChange={(e) => setUniversity(e.target.value)}
                                className="input-field"
                            >
                                <option value="Virtual University">Virtual University</option>
                                {/* Future unis */}
                            </select>
                        </div>

                        {/* Type Selector */}
                        <div>
                            <label className="label">Content Type</label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {['Lecture', 'Handout', 'Quiz', 'Quote', 'Concept'].map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setType(t)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            fontWeight: '700',
                                            background: type === t ? '#58cc02' : '#e5e5e5',
                                            color: type === t ? 'white' : '#777',
                                            boxShadow: type === t ? '0 4px 0 #46a302' : 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Course Selector */}
                        {type !== 'Quote' && (
                            <div style={{ position: 'relative' }}>
                                <label className="label">Course Code</label>

                                {/* Recents */}
                                {recentCourses.length > 0 && (
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#afafaf', alignSelf: 'center' }}>Recent:</span>
                                        {recentCourses.map(c => (
                                            <span
                                                key={c}
                                                onClick={() => selectCourse(c)}
                                                style={{
                                                    background: '#ddf4ff',
                                                    color: '#1cb0f6',
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    fontWeight: '700'
                                                }}
                                            >
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <input
                                    placeholder="Type to search (e.g. CS101)..."
                                    className="input-field"
                                    value={courseSearch}
                                    onChange={(e) => { setCourseSearch(e.target.value); setShowDropdown(true); }}
                                    onFocus={() => setShowDropdown(true)}
                                // required={type !== 'Quote'} // Optional for non-course stuff?
                                />

                                {/* Search Dropdown */}
                                {showDropdown && filteredCourses.length > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        background: 'white',
                                        border: '2px solid #e5e5e5',
                                        borderRadius: '12px',
                                        zIndex: 10,
                                        marginTop: '4px',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                    }}>
                                        {filteredCourses.map(c => (
                                            <div
                                                key={c.code}
                                                onClick={() => selectCourse(c.code)}
                                                style={{ padding: '12px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                                            >
                                                <b>{c.code}</b> - {c.title}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Fields based on Type */}
                        {type === 'Quote' && (
                            <>
                                <input name="description" placeholder="Quote Text..." className="input-field" value={formData.description} onChange={handleChange} required />
                                <input name="author" placeholder="Author Name" className="input-field" value={formData.author} onChange={handleChange} required />
                            </>
                        )}

                        {type === 'Concept' && (
                            <>
                                <input name="title" placeholder="Concept Title" className="input-field" value={formData.title} onChange={handleChange} required />
                                <textarea name="description" placeholder="Description..." className="input-field" style={{ minHeight: '100px' }} value={formData.description} onChange={handleChange} required />
                            </>
                        )}

                        {(type === 'Lecture' || type === 'Handout') && (
                            <>
                                <input name="title" placeholder={type === 'Lecture' ? "Lecture Title" : "Handout Name"} className="input-field" value={formData.title} onChange={handleChange} required />
                                <input name="resourceLink" placeholder={type === 'Lecture' ? "Video URL" : "File URL"} className="input-field" value={formData.resourceLink} onChange={handleChange} required />

                                {type === 'Lecture' && (
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', fontSize: '0.9rem', fontWeight: '700' }}>
                                        <input type="checkbox" checked={addQuiz} onChange={(e) => setAddQuiz(e.target.checked)} style={{ width: '20px', height: '20px' }} />
                                        Include Practice Quiz?
                                    </label>
                                )}
                            </>
                        )}

                        {(type === 'Quiz' || addQuiz) && (
                            <div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Paste Quiz JSON below:</p>
                                <textarea
                                    name="quizJson"
                                    placeholder='[ { "question": "What is 2+2?", "options": ["3", "4"], "correctAnswer": 1 } ]'
                                    className="input-field"
                                    style={{ minHeight: '150px', fontFamily: 'monospace', fontSize: '0.8rem' }}
                                    value={formData.quizJson}
                                    onChange={handleChange}
                                    required={type === 'Quiz'} // Required if main type is Quiz
                                />
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'UPLOADING...' : 'POST CONTENT'}
                        </button>

                        {message && <p style={{ fontWeight: '700', textAlign: 'center', color: message.includes('Success') ? '#58cc02' : 'red' }}>{message}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
}
