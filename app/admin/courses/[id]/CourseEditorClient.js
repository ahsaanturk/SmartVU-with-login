'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CourseEditorClient({ id }) {
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    // Forms
    const [showModuleForm, setShowModuleForm] = useState(false);
    const [moduleTitle, setModuleTitle] = useState('');
    const [editingModuleId, setEditingModuleId] = useState(null); // ID of module being edited

    // Lesson Form State (Active Module ID to show form for)
    const [activeModuleForm, setActiveModuleForm] = useState(null);
    const [lessonData, setLessonData] = useState({
        title: '',
        videoUrl: '',
        summary: '',
        minWatchTime: 2,
        quizQuestion: '',
        quizOption1: '',
        quizOption2: '',
        quizOption3: '',
        correctOption: 0
    });
    const [editingLessonId, setEditingLessonId] = useState(null); // ID of lesson being edited



    // Pre-Assessment State
    const [activePreAssessmentForm, setActivePreAssessmentForm] = useState(null);
    const [preAssessmentJson, setPreAssessmentJson] = useState('');

    // Handout State
    const [handouts, setHandouts] = useState([]);
    const [handoutTitle, setHandoutTitle] = useState('');
    const [handoutLink, setHandoutLink] = useState('');

    useEffect(() => {
        fetchCourseData();
    }, [id]);

    const fetchCourseData = () => {
        fetch(`/api/courses/${id}`, { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (data.course) {
                    setCourse(data.course);
                    setModules(data.modules); // Hierarchy
                    setHandouts(data.course.handouts || []);
                }
                setLoading(false);
            });
    };

    const handleCreateModule = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/modules', {
            method: 'POST',
            body: JSON.stringify({
                courseId: id,
                title: moduleTitle,
                order: modules.length + 1
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            setModuleTitle('');
            setShowModuleForm(false);
            fetchCourseData();
        }
    };

    const handleUpdateModule = async (e) => {
        e.preventDefault();
        const res = await fetch(`/api/modules/${editingModuleId}`, {
            method: 'PUT',
            body: JSON.stringify({
                title: moduleTitle
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            setModuleTitle('');
            setEditingModuleId(null);
            setShowModuleForm(false);
            fetchCourseData();
        }
    };

    const handleDeleteModule = async (moduleId) => {
        if (!confirm('Are you sure you want to delete this module? ALL associated lessons will also be deleted.')) return;

        const res = await fetch(`/api/modules/${moduleId}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            fetchCourseData();
        }
    };

    const handleCreateLesson = async (e, moduleId, currentLessonCount) => {
        e.preventDefault();
        // Construct Quiz Object
        const quiz = {
            questions: [{
                question: lessonData.quizQuestion,
                options: [lessonData.quizOption1, lessonData.quizOption2, lessonData.quizOption3],
                correctAnswer: Number(lessonData.correctOption)
            }]
        };

        const res = await fetch('/api/lessons', {
            method: 'POST',
            body: JSON.stringify({
                moduleId: moduleId,
                title: lessonData.title,
                type: lessonData.type,
                videoUrl: lessonData.type === 'Video' ? lessonData.videoUrl : undefined,
                textContent: lessonData.type === 'Text' ? lessonData.textContent : undefined,
                summary: lessonData.summary,
                minWatchTime: Number(lessonData.minWatchTime),
                order: currentLessonCount + 1,
                quiz: quiz
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            resetLessonForm();
            fetchCourseData();
        } else {
            alert('Failed to create lesson');
        }
    };

    const handleUpdateLesson = async (e) => {
        e.preventDefault();
        // Construct Quiz Object (same as create)
        const quiz = {
            questions: [{
                question: lessonData.quizQuestion,
                options: [lessonData.quizOption1, lessonData.quizOption2, lessonData.quizOption3],
                correctAnswer: Number(lessonData.correctOption)
            }]
        };

        const res = await fetch(`/api/lessons/${editingLessonId}`, {
            method: 'PUT',
            body: JSON.stringify({
                title: lessonData.title,
                type: lessonData.type,
                videoUrl: lessonData.type === 'Video' ? lessonData.videoUrl : undefined,
                textContent: lessonData.type === 'Text' ? lessonData.textContent : undefined,
                summary: lessonData.summary,
                minWatchTime: Number(lessonData.minWatchTime),
                quiz: quiz
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            resetLessonForm();
            fetchCourseData();
        } else {
            alert('Failed to update lesson');
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!confirm('Are you sure you want to delete this lesson?')) return;

        const res = await fetch(`/api/lessons/${lessonId}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            fetchCourseData();
        }
    };

    const resetLessonForm = () => {
        setActiveModuleForm(null);
        setEditingLessonId(null);
        setLessonData({
            title: '', type: 'Video', videoUrl: '', textContent: '', summary: '', minWatchTime: 2,
            quizQuestion: '', quizOption1: '', quizOption2: '', quizOption3: '', correctOption: 0
        });
    };

    const startEditingLesson = (lesson, moduleId) => {
        setActiveModuleForm(moduleId);
        setEditingLessonId(lesson._id);

        // Extract quiz data if available
        let qQuestion = '', qOpt1 = '', qOpt2 = '', qOpt3 = '', qCorrect = 0;
        if (lesson.quiz && lesson.quiz.questions && lesson.quiz.questions.length > 0) {
            const q = lesson.quiz.questions[0];
            qQuestion = q.question;
            qOpt1 = q.options[0] || '';
            qOpt2 = q.options[1] || '';
            qOpt3 = q.options[2] || '';
            qCorrect = q.correctAnswer;
        }

        setLessonData({
            title: lesson.title,
            type: lesson.type || 'Video',
            videoUrl: lesson.videoUrl || '',
            textContent: lesson.textContent || '',
            summary: lesson.summary,
            minWatchTime: lesson.minWatchTime,
            quizQuestion: qQuestion,
            quizOption1: qOpt1,
            quizOption2: qOpt2,
            quizOption3: qOpt3,
            correctOption: qCorrect
        });
    };







    const handleSavePreAssessment = async (e, moduleId) => {
        e.preventDefault();
        try {
            // Validate JSON
            const data = JSON.parse(preAssessmentJson);
            if (!data.questions || !Array.isArray(data.questions)) {
                alert('Invalid JSON: Must contain "questions" array.');
                return;
            }

            const res = await fetch(`/api/admin/modules/${moduleId}/pre-assessment`, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                setActivePreAssessmentForm(null);
                alert('Pre-Assessment Saved!');
                fetchCourseData();
            }
        } catch (err) {
            alert('Invalid JSON Syntax');
        }
    };

    const handleAddHandout = async (e) => {
        e.preventDefault();
        const newHandout = { title: handoutTitle, link: handoutLink, type: 'Drive' };
        const updatedHandouts = [...handouts, newHandout];

        // Optimistic Update
        setHandouts(updatedHandouts);
        setHandoutTitle('');
        setHandoutLink('');

        await saveHandouts(updatedHandouts);
    };

    const handleDeleteHandout = async (index) => {
        if (!confirm('Remove this handout?')) return;
        const updatedHandouts = handouts.filter((_, i) => i !== index);
        setHandouts(updatedHandouts);
        await saveHandouts(updatedHandouts);
    };

    const saveHandouts = async (updatedList) => {
        // We use the Main Course Update API we just modified
        try {
            const res = await fetch(`/api/admin/courses/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...course, // Keep existing course fields
                    handouts: updatedList
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) alert('Failed to save handout changes.');
        } catch (err) {
            console.error(err);
            alert('Error saving handouts');
        }
    };

    if (loading) return <div className="page-container">Loading details...</div>;
    if (!course) return <div className="page-container">Course not found</div>;

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
            <Link href="/admin/courses" style={{ color: 'var(--text-muted)', fontWeight: '700', marginBottom: '16px', display: 'inline-block' }}>
                ← BACK TO COURSES
            </Link>

            <h1 className="title">{course.name}</h1>
            <p className="subtitle">{course.code} • {course.degree}</p>

            <hr style={{ margin: '32px 0', border: 'none', borderBottom: '2px solid #e5e5e5' }} />

            {/* HANDOUTS SECTION */}
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Handouts & Resources</h2>

                {/* List */}
                <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
                    {handouts.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No handouts added yet.</p>}

                    {handouts.map((h, i) => (
                        <div key={i} className="stat-card" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e5e5' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '1.5rem' }}>📄</span>
                                <div>
                                    <div style={{ fontWeight: '700' }}>{h.title}</div>
                                    <a href={h.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#1cb0f6' }}>{h.link}</a>
                                </div>
                            </div>
                            <button onClick={() => handleDeleteHandout(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>
                        </div>
                    ))}
                </div>

                {/* Add Form */}
                <form onSubmit={handleAddHandout} className="stat-card" style={{ background: '#f9f9f9', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                        className="input-field"
                        placeholder="Handout Title"
                        value={handoutTitle}
                        onChange={e => setHandoutTitle(e.target.value)}
                        required
                        style={{ flex: 1 }}
                    />
                    <input
                        className="input-field"
                        placeholder="Drive Link / URL"
                        value={handoutLink}
                        onChange={e => setHandoutLink(e.target.value)}
                        required
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ width: 'auto', marginBottom: 0 }}>+ ADD</button>
                </form>
            </div>

            <hr style={{ margin: '32px 0', border: 'none', borderBottom: '2px solid #e5e5e5' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Curriculum</h2>
                <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => {
                    setEditingModuleId(null);
                    setModuleTitle('');
                    setShowModuleForm(!showModuleForm);
                }}>
                    + ADD MODULE
                </button>
            </div>

            {showModuleForm && (
                <div className="stat-card" style={{ marginBottom: '32px', border: '2px solid #e5e5e5' }}>
                    <form onSubmit={editingModuleId ? handleUpdateModule : handleCreateModule} style={{ display: 'flex', gap: '16px' }}>
                        <input
                            className="input-field"
                            placeholder="Module Title (e.g. Basics of OOP)"
                            value={moduleTitle}
                            onChange={e => setModuleTitle(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>SAVE</button>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {modules.map((module, index) => (
                    <div key={module._id} className="stat-card" style={{ border: '2px solid #e5e5e5', padding: '0' }}>
                        <div style={{ padding: '20px', background: '#f7f7f7', borderBottom: '2px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '1.2rem' }}>Unit {index + 1}: {module.title}</h3>
                                <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>{module.lessons.length} LESSONS</span>
                                <div style={{ display: 'inline-flex', gap: '8px', marginLeft: '16px' }}>
                                    <button
                                        onClick={() => {
                                            setEditingModuleId(module._id);
                                            setModuleTitle(module.title);
                                            setShowModuleForm(true);
                                        }}
                                        style={{ fontSize: '0.8rem', color: '#1cb0f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                        EDIT
                                    </button>
                                    <button
                                        onClick={() => handleDeleteModule(module._id)}
                                        style={{ fontSize: '0.8rem', color: '#ff4b4b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                        DELETE
                                    </button>
                                </div>
                            </div>
                            {index !== 0 && (
                                <button
                                    className="btn btn-outline"
                                    style={{ width: 'auto', fontSize: '0.8rem', padding: '8px 12px', marginLeft: '8px', borderColor: '#1cb0f6', color: '#1cb0f6' }}
                                    onClick={() => {
                                        setActivePreAssessmentForm(activePreAssessmentForm === module._id ? null : module._id);
                                        if (module.preAssessment && module.preAssessment.questions.length > 0) {
                                            // Pretty print existing JSON
                                            setPreAssessmentJson(JSON.stringify({
                                                questions: module.preAssessment.questions,
                                                passingPercentage: module.preAssessment.passingPercentage
                                            }, null, 2));
                                        } else {
                                            // Default Template
                                            setPreAssessmentJson(JSON.stringify({
                                                passingPercentage: 60,
                                                questions: [
                                                    {
                                                        question: "Sample Question?",
                                                        options: ["A", "B", "C", "D"],
                                                        correctAnswer: 0
                                                    }
                                                ]
                                            }, null, 2));
                                        }
                                    }}
                                >
                                    📝 PRE-ASSESSMENT
                                </button>
                            )}
                        </div>

                        {/* Pre-Assessment Form */}
                        {activePreAssessmentForm === module._id && (
                            <div style={{ padding: '20px', background: '#e5f6fd', borderBottom: '2px solid #e5e5e5' }}>
                                <h4 style={{ marginBottom: '10px', color: '#1cb0f6' }}>Manage Pre-Assessment Quiz (JSON)</h4>
                                <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}>
                                    Paste your quiz questions in JSON format below. Required format: <code>{"{ question, options: [], correctAnswer: 0 }"}</code>
                                </p>
                                <form onSubmit={(e) => handleSavePreAssessment(e, module._id)}>
                                    <textarea
                                        className="input-field"
                                        style={{ height: '300px', fontFamily: 'monospace', fontSize: '0.9rem' }}
                                        value={preAssessmentJson}
                                        onChange={e => setPreAssessmentJson(e.target.value)}
                                    />
                                    <br /><br />
                                    <button className="btn btn-primary" style={{ width: 'auto', background: '#1cb0f6', borderBottom: '4px solid #1480b3' }}>SAVE PRE-ASSESSMENT</button>
                                </form>
                            </div>
                        )}



                        <div style={{ padding: '20px' }}>
                            {module.lessons.map((lesson, lIndex) => (
                                <div key={lesson._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
                                    <div style={{ background: '#58cc02', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                                        {lIndex + 1}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0 }}>{lesson.title}</h4>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lesson.videoUrl ? 'Video' : 'Text'} • {lesson.minWatchTime || 2}m Watch</p>
                                    </div>
                                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => startEditingLesson(lesson, module._id)}
                                            style={{ fontSize: '0.8rem', color: '#1cb0f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                            EDIT
                                        </button>
                                        <button
                                            onClick={() => handleDeleteLesson(lesson._id)}
                                            style={{ fontSize: '0.8rem', color: '#ff4b4b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                            DELETE
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div style={{ marginTop: '20px' }}>
                                {activeModuleForm === module._id ? (
                                    <div style={{ background: '#fff', border: '2px solid #e5e5e5', padding: '20px', borderRadius: '12px' }}>
                                        <h4 style={{ marginBottom: '16px' }}>{editingLessonId ? 'Edit Lesson' : 'New Lesson'}</h4>
                                        <form onSubmit={(e) => editingLessonId ? handleUpdateLesson(e) : handleCreateLesson(e, module._id, module.lessons.length)}>
                                            <div style={{ display: 'grid', gap: '16px' }}>
                                                <input className="input-field" placeholder="Lesson Title" value={lessonData.title} onChange={e => setLessonData({ ...lessonData, title: e.target.value })} required />

                                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                    <label style={{ fontWeight: 'bold' }}>Lesson Type:</label>
                                                    <select
                                                        className="input-field"
                                                        style={{ width: 'auto' }}
                                                        value={lessonData.type}
                                                        onChange={e => setLessonData({ ...lessonData, type: e.target.value })}
                                                    >
                                                        <option value="Video">Video</option>
                                                        <option value="Text">Text</option>
                                                    </select>
                                                </div>

                                                {lessonData.type === 'Video' ? (
                                                    <input className="input-field" placeholder="YouTube URL" value={lessonData.videoUrl} onChange={e => setLessonData({ ...lessonData, videoUrl: e.target.value })} required />
                                                ) : (
                                                    <textarea
                                                        className="input-field"
                                                        placeholder="Main Text Content (HTML supported)"
                                                        style={{ height: '200px', fontFamily: 'monospace' }}
                                                        value={lessonData.textContent}
                                                        onChange={e => setLessonData({ ...lessonData, textContent: e.target.value })}
                                                        required
                                                    />
                                                )}

                                                <textarea className="input-field" placeholder="Lesson Summary (Use *bold* or **Heading**)" value={lessonData.summary} onChange={e => setLessonData({ ...lessonData, summary: e.target.value })} required />

                                                <div>
                                                    <label style={{ fontWeight: '700', fontSize: '0.9rem' }}>Minimum Watch Time (Minutes)</label>
                                                    <p style={{ fontSize: '0.8rem', color: '#666', margin: '4px 0' }}>Set to 0 to minimize waiting time.</p>
                                                    <input
                                                        type="number"
                                                        className="input-field"
                                                        value={lessonData.minWatchTime}
                                                        onChange={e => setLessonData({ ...lessonData, minWatchTime: e.target.value })}
                                                        min="0"
                                                    />
                                                </div>

                                                <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
                                                    <p style={{ fontWeight: '700', marginBottom: '8px' }}>Attach Quiz</p>
                                                    <input className="input-field" placeholder="Question" value={lessonData.quizQuestion} onChange={e => setLessonData({ ...lessonData, quizQuestion: e.target.value })} required style={{ marginBottom: '8px' }} />
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                                        <input className="input-field" placeholder="Option 1" value={lessonData.quizOption1} onChange={e => setLessonData({ ...lessonData, quizOption1: e.target.value })} required />
                                                        <input className="input-field" placeholder="Option 2" value={lessonData.quizOption2} onChange={e => setLessonData({ ...lessonData, quizOption2: e.target.value })} required />
                                                        <input className="input-field" placeholder="Option 3" value={lessonData.quizOption3} onChange={e => setLessonData({ ...lessonData, quizOption3: e.target.value })} required />
                                                    </div>
                                                    <select className="input-field" style={{ marginTop: '8px' }} value={lessonData.correctOption} onChange={e => setLessonData({ ...lessonData, correctOption: e.target.value })}>
                                                        <option value={0}>Option 1 is Correct</option>
                                                        <option value={1}>Option 2 is Correct</option>
                                                        <option value={2}>Option 3 is Correct</option>
                                                    </select>
                                                </div>

                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button type="submit" className="btn btn-primary">{editingLessonId ? 'UPDATE LESSON' : 'SAVE LESSON'}</button>
                                                    <button type="button" className="btn btn-outline" onClick={resetLessonForm} style={{ background: '#f7f7f7', color: 'black' }}>CANCEL</button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            resetLessonForm();
                                            setActiveModuleForm(module._id);
                                        }}
                                        style={{ width: '100%', padding: '12px', background: 'none', border: '2px dashed #e5e5e5', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', color: 'var(--text-muted)' }}
                                    >
                                        + ADD LESSON
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
