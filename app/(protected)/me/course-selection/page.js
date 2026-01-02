
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CourseSelectionPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [selectedCodes, setSelectedCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Fetch User and Courses in one go or sequentially
        // Better: Fetch User then Eligible Courses
        fetch('/api/me')
            .then(res => res.json())
            .then(userData => {
                if (userData.user) {
                    setUser(userData.user);

                    // Fetch Eligible Courses (Strict Mode)
                    fetch('/api/student/eligible-courses')
                        .then(res => res.json())
                        .then(data => {
                            setAvailableCourses(data.courses || []);

                            // Restore selection
                            const saved = userData.user.selectedCourses || [];
                            setSelectedCodes(saved);
                        });
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const toggleCourse = (code) => {
        if (selectedCodes.includes(code)) {
            setSelectedCodes(selectedCodes.filter(c => c !== code));
        } else {
            setSelectedCodes([...selectedCodes, code]);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/me/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courses: selectedCodes }),
            });
            if (res.ok) {
                router.push('/learning'); // Go to learning page to see folders
            }
        } catch (error) {
            alert('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="page-container">Loading...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="title">Course Selection</h1>
            <p className="subtitle">{user?.degree} • Semester {user?.semester}</p>

            <div className="stat-card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f7f7f7', textAlign: 'left' }}>
                            <th style={{ padding: '12px', borderRadius: '8px 0 0 8px' }}>Select</th>
                            <th style={{ padding: '12px' }}>Code</th>
                            <th style={{ padding: '12px' }}>Title</th>
                            <th style={{ padding: '12px', borderRadius: '0 8px 8px 0' }}>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {availableCourses.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>No courses found for this semester.</td></tr>
                        ) : (
                            availableCourses.map(course => {
                                const isRequired = course.type === 'Required';
                                const isChecked = selectedCodes.includes(course.code);

                                return (
                                    <tr key={course.code} style={{ borderBottom: '1px solid #e5e5e5' }}>
                                        <td style={{ padding: '12px' }}>
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                disabled={isRequired}
                                                onChange={() => toggleCourse(course.code)}
                                                style={{ width: '20px', height: '20px', accentColor: '#58cc02' }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px', fontWeight: '800' }}>{course.code}</td>
                                        <td style={{ padding: '12px' }}>{course.title || course.name}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                fontSize: '0.8rem',
                                                fontWeight: '700',
                                                background: isRequired ? '#e5e5e5' : '#fff4db',
                                                color: isRequired ? '#777' : '#ffa500'
                                            }}>
                                                {course.type}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button onClick={handleSave} className="btn btn-primary" style={{ width: 'auto' }} disabled={saving}>
                        {saving ? 'SAVING...' : 'SAVE SELECTION'}
                    </button>
                </div>
            </div>
        </div>
    );
}
