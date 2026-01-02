
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CourseEditor({ params }) {
    // Unwrap params for Next.js 15+
    const unwrapParams = use(params);
    const { id } = unwrapParams;

    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    // Forms
    const [showModuleForm, setShowModuleForm] = useState(false);
    const [moduleTitle, setModuleTitle] = useState('');

    // Lesson Form State (Active Module ID to show form for)
    const [activeModuleForm, setActiveModuleForm] = useState(null);
    const [lessonData, setLessonData] = useState({
        title: '',
        videoUrl: '',
        summary: '',
        quizQuestion: '',
        quizOption1: '',
        quizOption2: '',
        quizOption3: '',
        correctOption: 0
    });

    useEffect(() => {
        fetchCourseData();
    }, [id]);

    const fetchCourseData = () => {
        fetch(`/api/courses/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.course) {
                    setCourse(data.course);
                    setModules(data.modules); // Hierarchy
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
                videoUrl: lessonData.videoUrl,
                summary: lessonData.summary,
                order: currentLessonCount + 1,
                quiz: quiz
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            setActiveModuleForm(null);
            setLessonData({
                title: '', videoUrl: '', summary: '',
                quizQuestion: '', quizOption1: '', quizOption2: '', quizOption3: '', correctOption: 0
            });
            fetchCourseData();
        } else {
            alert('Failed to create lesson');
        }
    };

    if (loading) return <div className="page-container">Loading details...</div>;
    if (!course) return <div className="page-container">Course not found</div>;

    return (
        <div className="page-container">
            <Link href="/admin/courses" style={{ color: 'var(--text-muted)', fontWeight: '700', marginBottom: '16px', display: 'inline-block' }}>
                ← BACK TO COURSES
            </Link>

            <h1 className="title">{course.name}</h1>
            <p className="subtitle">{course.code} • {course.degree}</p>

            <hr style={{ margin: '32px 0', border: 'none', borderBottom: '2px solid #e5e5e5' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Curriculum</h2>
                <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowModuleForm(!showModuleForm)}>
                    + ADD MODULE
                </button>
            </div>

            {showModuleForm && (
                <div className="stat-card" style={{ marginBottom: '32px', border: '2px solid #e5e5e5' }}>
                    <form onSubmit={handleCreateModule} style={{ display: 'flex', gap: '16px' }}>
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
                        <div style={{ padding: '20px', background: '#f7f7f7', borderBottom: '2px solid #e5e5e5', display: 'flex', justifyContent: 'space-between' }}>
                            <h3 style={{ fontSize: '1.2rem' }}>Unit {index + 1}: {module.title}</h3>
                            <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>{module.lessons.length} LESSONS</span>
                        </div>

                        <div style={{ padding: '20px' }}>
                            {module.lessons.map((lesson, lIndex) => (
                                <div key={lesson._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
                                    <div style={{ background: '#58cc02', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                                        {lIndex + 1}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0 }}>{lesson.title}</h4>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Video + Quiz</p>
                                    </div>
                                </div>
                            ))}

                            <div style={{ marginTop: '20px' }}>
                                {activeModuleForm === module._id ? (
                                    <div style={{ background: '#fff', border: '2px solid #e5e5e5', padding: '20px', borderRadius: '12px' }}>
                                        <h4 style={{ marginBottom: '16px' }}>New Lesson</h4>
                                        <form onSubmit={(e) => handleCreateLesson(e, module._id, module.lessons.length)}>
                                            <div style={{ display: 'grid', gap: '16px' }}>
                                                <input className="input-field" placeholder="Lesson Title" value={lessonData.title} onChange={e => setLessonData({ ...lessonData, title: e.target.value })} required />
                                                <input className="input-field" placeholder="YouTube URL" value={lessonData.videoUrl} onChange={e => setLessonData({ ...lessonData, videoUrl: e.target.value })} required />
                                                <textarea className="input-field" placeholder="Lesson Summary" value={lessonData.summary} onChange={e => setLessonData({ ...lessonData, summary: e.target.value })} required />

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
                                                    <button type="submit" className="btn btn-primary">SAVE LESSON</button>
                                                    <button type="button" className="btn btn-outline" onClick={() => setActiveModuleForm(null)} style={{ background: '#f7f7f7', color: 'black' }}>CANCEL</button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setActiveModuleForm(module._id);
                                            setLessonData({ title: '', videoUrl: '', summary: '', quizQuestion: '', quizOption1: '', quizOption2: '', quizOption3: '', correctOption: 0 });
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
