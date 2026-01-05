
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import LoadingScreen from '@/app/components/LoadingScreen';

export default function CourseMapPage({ params }) {
    const unwrapParams = use(params);
    const { courseId } = unwrapParams;
    const router = useRouter();

    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch Course + Progress parallel-ish
        Promise.all([
            fetch(`/api/courses/${courseId}`).then(res => res.json()),
            fetch(`/api/courses/${courseId}/progress`).then(res => res.json()) // Need to implement this endpoint or include in course fetch
        ]).then(([courseData, progressData]) => {
            if (courseData.course) {
                setCourse(courseData.course);
                setModules(courseData.modules);
            }
            if (progressData.progress) {
                setProgress(progressData.progress);
            }
            setLoading(false);
        }).catch(err => setLoading(false));
    }, [courseId]);

    const handleTestOut = (moduleId, hasPreAssessment) => {
        if (hasPreAssessment) {
            router.push(`/learning/${courseId}/module/${moduleId}/pre-assessment`);
        } else {
            // Legacy/No-Quiz behavior (Skip simulation or just alert)
            alert("No pre-assessment available for this module. Watch the lectures to proceed.");
        }
    };

    if (loading) return <LoadingScreen />;
    if (!course) return <div className="page-container">Course not found</div>;

    // Helper to check status
    const isLessonCompleted = (id) => progress?.completedLessons?.includes(id);
    const isModuleUnlocked = (id) => progress?.unlockedModules?.includes(id);

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', padding: '16px 0', borderBottom: '2px solid #e5e5e5', zIndex: 10, display: 'flex', alignItems: 'center', gap: '16px', backdropFilter: 'blur(5px)' }}>
                <Link href="/learning" style={{ fontSize: '1.5rem', textDecoration: 'none' }}>←</Link>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.1rem', margin: 0 }}>{course.code}</h2>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{course.name}</p>
                </div>
                {/* Stats */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff9600', fontWeight: 'bold' }}>
                        <span>🔥</span>
                        <span>{progress?.streak || 0}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1cb0f6', fontWeight: 'bold' }}>
                        <span>⚡</span>
                        <span>{progress?.xp || 0} XP</span>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
                {modules.map((module, cIndex) => {
                    const moduleUnlocked = isModuleUnlocked(module._id) || cIndex === 0;

                    return (
                        <div key={module._id} className="animate-pop-in" style={{ opacity: moduleUnlocked ? 1 : 0.6 }}>
                            {/* Module Header */}
                            <div className="module-header" style={{
                                background: moduleUnlocked ? '#58cc02' : '#e5e5e5',
                                color: moduleUnlocked ? 'white' : '#afafaf',
                                padding: '16px',
                                borderRadius: '16px',
                                marginBottom: '24px',
                                textAlign: 'center',
                                boxShadow: `0 4px 0 ${moduleUnlocked ? '#46a302' : '#cfcfcf'}`,
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div style={{ textAlign: 'left' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Unit {cIndex + 1}</h3>
                                    <p style={{ margin: 0 }}>{module.title}</p>
                                </div>

                                {!moduleUnlocked && (
                                    <button
                                        className="jump-button"
                                        onClick={() => handleTestOut(module._id, module.preAssessment?.questions?.length > 0)}
                                    >
                                        <span className="jump-text">JUMP HERE</span>
                                        <span className="jump-icon">🚀</span>
                                    </button>
                                )}
                            </div>
                            <style jsx>{`
                                .jump-button {
                                    background: #fff;
                                    color: #58cc02;
                                    border: none;
                                    padding: 8px 16px;
                                    border-radius: 12px;
                                    font-weight: bold;
                                    cursor: pointer;
                                    box-shadow: 0 4px 0 #ddd;
                                    transition: transform 0.1s;
                                    white-space: nowrap;
                                }
                                .jump-button:active {
                                    box-shadow: 0 0 0 #ddd;
                                    transform: translateY(4px);
                                }
                                .jump-icon { display: none; }
                                
                                @media (max-width: 480px) {
                                    .jump-text { display: none; }
                                    .jump-icon { display: inline; font-size: 1.2rem; }
                                    .jump-button { padding: 8px; }
                                }
                            `}</style>

                            {/* Lessons Path */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                                {
                                    module.lessons.map((lesson, lIndex) => {
                                        const offset = (lIndex % 4 === 1) ? '-40px' : (lIndex % 4 === 3) ? '40px' : '0px';
                                        const completed = isLessonCompleted(lesson._id);

                                        // Determine if Locked
                                        // It is locked if: Module is locked AND (NOT completed AND previous lesson is NOT completed)
                                        // Actually, simpler: It is locked if it is NOT completed AND it is NOT the very next one.
                                        // MVP: Just check completed status. "Active" is the first incomplete one.

                                        // Quick Hack for MVP flow:
                                        // Unlocked if: (Module Unlocked) OR (Previous Lesson Completed)
                                        // Color: Gold (Completed), Color (Active), Grey (Locked)

                                        let status = 'locked';
                                        if (completed) status = 'completed';
                                        else if (moduleUnlocked) status = 'active'; // Need finer grain, but ok for now.

                                        // Refined Lock Logic:
                                        // If not moduleUnlocked -> Locked.
                                        // If moduleUnlocked:
                                        //   If completed -> Completed.
                                        //   If prev is completed (or index 0) -> Active.
                                        //   Else -> Locked.

                                        if (!moduleUnlocked) status = 'locked';
                                        else if (completed) status = 'completed';
                                        else {
                                            // If module is unlocked (via pre-assessment), ALL its lessons should be available (Green/Active).
                                            // User requested: "unlocked (green)... not watched (yellow)"
                                            // So we bypass the sequential previous-lesson check for explicitly unlocked modules.
                                            status = 'active';
                                        }

                                        // Colors
                                        const bg = status === 'completed' ? '#ffc800' : status === 'active' ? '#58cc02' : '#e5e5e5';
                                        const shadow = status === 'completed' ? '#e5b400' : status === 'active' ? '#46a302' : '#cfcfcf';
                                        const starColor = status === 'locked' ? '#afafaf' : 'white';

                                        return (
                                            <Link
                                                key={lesson._id}
                                                href={status !== 'locked' ? `/learning/${courseId}/lesson/${lesson._id}` : '#'}
                                                style={{
                                                    textDecoration: 'none',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    transform: `translateX(${offset})`,
                                                    pointerEvents: status === 'locked' ? 'none' : 'auto'
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: '70px',
                                                        height: '70px',
                                                        background: bg,
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: `0 6px 0 ${shadow}`,
                                                        marginBottom: '10px',
                                                        position: 'relative',
                                                        transition: '0.2s'
                                                    }}
                                                    className={status === 'active' ? "hover-bounce" : ""}
                                                >
                                                    {/* Dynamic Icon based on Type */}
                                                    {(() => {
                                                        const videoIcons = [
                                                            // Play Button
                                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={starColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
                                                            // Film Strip / Camera
                                                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={starColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>,
                                                            // TV / Screen
                                                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={starColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>
                                                        ];

                                                        const textIcons = [
                                                            // Book (Open)
                                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={starColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>,
                                                            // Document / Article
                                                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={starColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
                                                            // Bulb (Concept)
                                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={starColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.7.18-1.48 0-2.2-.5-1.9-2.2-3.3-4.1-3.3-1.8 0-3.5 1.3-4 3.1-.2.8-.2 1.6 0 2.3.5 1.7 2.1 2.9 3.9 3.1.5 0 1 .1 1.5.1 1.7-.2 3.2-1.4 3.7-3.1z"></path></svg>,
                                                            // Feather / Quill
                                                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={starColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line></svg>
                                                        ];

                                                        const isText = lesson.type === 'Text';
                                                        const targetSet = isText ? textIcons : videoIcons;

                                                        // Use lesson index to rotate through the specific set
                                                        const Icon = targetSet[lIndex % targetSet.length];
                                                        return Icon;
                                                    })()}
                                                    {status === 'active' && <div className="pulse-ring"></div>}
                                                </div>
                                                <span style={{ color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.9rem' }}>{lesson.title}</span>
                                            </Link>
                                        );
                                    })
                                }
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
