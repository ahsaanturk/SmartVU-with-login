
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

export default function CourseMapPage({ params }) {
    const unwrapParams = use(params);
    const { courseId } = unwrapParams;

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

    const handleTestOut = async (moduleId) => {
        const passed = confirm("Take the Unit Test to skip ahead? (Simulation: Click OK to Pass)");
        if (!passed) return;

        const res = await fetch('/api/modules/test-out', {
            method: 'POST',
            body: JSON.stringify({ moduleId, courseId, passed: true }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            window.location.reload();
        }
    };

    if (loading) return <div className="page-container">Loading path...</div>;
    if (!course) return <div className="page-container">Course not found</div>;

    // Helper to check status
    const isLessonCompleted = (id) => progress?.completedLessons?.includes(id);
    const isModuleUnlocked = (id) => progress?.unlockedModules?.includes(id);

    // Calculate Global Lesson Index to determine "current" lesson
    let globalLessonIndex = 0;

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
                    // Logic: Module is unlocked if specifically unlocked OR previous module is fully complete (simplified: just check specific unlock or index 0 for now, or check if all lessons of prev module are done)

                    // Improved Logic for "Next Active Lesson" 
                    // We iterate lessons. If a lesson is NOT complete, it is the "Active" one. All subsequent are "Locked".
                    // Unless module is explicitly unlocked.

                    return (
                        <div key={module._id} className="animate-pop-in" style={{ opacity: moduleUnlocked ? 1 : 0.6 }}>
                            {/* Module Header */}
                            <div style={{ background: moduleUnlocked ? '#58cc02' : '#e5e5e5', color: moduleUnlocked ? 'white' : '#afafaf', padding: '16px', borderRadius: '16px', marginBottom: '24px', textAlign: 'center', boxShadow: `0 4px 0 ${moduleUnlocked ? '#46a302' : '#cfcfcf'}`, position: 'relative' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Unit {cIndex + 1}</h3>
                                <p>{module.title}</p>

                                {!moduleUnlocked && (
                                    <button
                                        onClick={() => handleTestOut(module._id)}
                                        style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: '#fff', color: '#58cc02', border: 'none', padding: '8px 12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 0 #ddd' }}
                                    >
                                        Jump Here?
                                    </button>
                                )}
                            </div>

                            {/* Lessons Path */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                                {module.lessons.map((lesson, lIndex) => {
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
                                        // Check if it's the first incomplete lesson
                                        const prevLesson = module.lessons[lIndex - 1];
                                        if (!prevLesson || isLessonCompleted(prevLesson._id)) {
                                            status = 'active';
                                        } else {
                                            status = 'locked';
                                        }
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
                                                <span style={{ fontSize: '2rem', color: starColor }}>★</span>
                                                {status === 'active' && <div className="pulse-ring"></div>}
                                            </div>
                                            <span style={{ color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.9rem' }}>{lesson.title}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
