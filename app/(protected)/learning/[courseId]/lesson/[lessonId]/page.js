
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LessonPage({ params }) {
    const unwrapParams = use(params);
    const { courseId, lessonId } = unwrapParams;
    const router = useRouter();

    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState('learn'); // 'learn' or 'quiz'

    // Quiz State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [feedback, setFeedback] = useState(null);

    // Result State
    const [xpGained, setXpGained] = useState(0);
    const [streakUpdated, setStreakUpdated] = useState(false);
    const [quizSuccess, setQuizSuccess] = useState(false);
    const [nextLessonId, setNextLessonId] = useState(null);

    // Watch Timer State
    const [watchTimer, setWatchTimer] = useState(0);

    useEffect(() => {
        fetch(`/api/lessons/${lessonId}`)
            .then(res => res.json())
            .then(data => {
                if (data.lesson) {
                    setLesson(data.lesson);
                    // Initialize timer based on admin setting (default 2 min aka 120s)
                    // If minWatchTime is undefined/null, treat as 0 (Optional/No Wait)
                    // Previously we defaulted to 2, now we respect 0.
                    const minTime = (data.lesson.minWatchTime !== undefined && data.lesson.minWatchTime !== null)
                        ? data.lesson.minWatchTime * 60
                        : 0;
                    setWatchTimer(minTime);
                }
                setLoading(false);
            });
    }, [lessonId]);

    // Watch Timer Countdown
    useEffect(() => {
        if (watchTimer > 0 && mode === 'learn' && !lockout) {
            const timer = setInterval(() => {
                setWatchTimer(prev => prev > 0 ? prev - 1 : 0);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [watchTimer, mode, lockout]);

    // Focus Management: Blur iframe when clicking outside to help dismiss controls/focus
    useEffect(() => {
        const handleOutsideTap = () => {
            if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
                document.activeElement.blur();
                window.focus();
            }
        };

        window.addEventListener('click', handleOutsideTap);
        window.addEventListener('touchstart', handleOutsideTap);
        return () => {
            window.removeEventListener('click', handleOutsideTap);
            window.removeEventListener('touchstart', handleOutsideTap);
        };
    }, []);

    const getYoutubeId = (url) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const parseCustomMarkdown = (text) => {
        if (!text) return '';
        let html = text
            // Escape HTML (basic) logic could go here if we were stricter, but for Admin entered content trust is okay for MVP
            // Bold AND Large: **text**
            .replace(/\*\*(.*?)\*\*/g, '<strong style="font-size: 1.2em; color: #000;">$1</strong>')
            // Bold: *text*
            .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
            // Newlines to <br>
            .replace(/\n/g, '<br />');
        return html;
    };

    const handleOptionSelect = (idx) => {
        if (selectedOption !== null) return;
        setSelectedOption(idx);

        const currentQ = lesson.quiz.questions[currentQuestionIndex];
        if (idx === currentQ.correctAnswer) {
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }
    };

    const handleNextQuestion = async () => {
        const isCorrect = feedback === 'correct';
        let newScore = score;
        if (isCorrect) newScore = score + 1;
        setScore(newScore);

        if (currentQuestionIndex + 1 < lesson.quiz.questions.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setFeedback(null);
        } else {
            // Quiz Finished
            finishQuiz(newScore, lesson.quiz.questions.length);
        }
    };

    const finishQuiz = async (finalScore, totalQuestions) => {
        // Assume Passing is 100% for Strict Logic, or maybe > 50%. 
        // User asked: "if he done the quiz correctly... go to next" vs "wrong... XP 30... rewatch"
        // Let's assume Valid = 100% correct, or at least they didn't fail ALL.
        // Actually the prompt implies: Correct = 60XP, Wrong = 30XP. 
        // Implies binary outcome per quiz? Or is it per question?
        // Prompt says: "if he give correct answer... XP 60... wrong answer... XP 30... roughly after 2 min"
        // This implies the SESSION is validated. Let's strictly require 100% for the "Correct" path (60XP) 
        // and anything else is "Wrong" path (30XP + Lockout).

        const isPerfect = finalScore === totalQuestions;

        setLoading(true); // temporary loading state
        try {
            const res = await fetch('/api/lessons/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessonId,
                    courseId,
                    quizCorrect: isPerfect
                })
            });

            const data = await res.json();

            if (data.success) {
                setXpGained(data.xpGained);
                setStreakUpdated(data.streakUpdated);
                if (data.nextLessonId) {
                    setNextLessonId(data.nextLessonId);
                }
                setQuizSuccess(true);
            } else {
                setQuizSuccess(false);
            }
            setQuizCompleted(true);

        } catch (err) {
            console.error('Failed to update progress', err);
        }
        setLoading(false);
    };

    if (loading) return <div className="page-container">Loading lesson...</div>;
    if (!lesson) return <div className="page-container">Lesson not found</div>;

    const videoId = getYoutubeId(lesson.videoUrl);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            {/* Header */}
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link href={`/learning/${courseId}`} style={{ color: 'var(--text-muted)', fontSize: '1.5rem', textDecoration: 'none' }}>✕</Link>
                <div style={{ flex: 1, padding: '0 10px' }}>
                    <div style={{ height: '12px', background: '#e5e5e5', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{
                            width: mode === 'learn' ? '50%' : `${((currentQuestionIndex + 1) / lesson.quiz.questions.length) * 100}%`,
                            height: '100%',
                            background: '#58cc02',
                            transition: 'width 0.3s ease'
                        }}></div>
                    </div>
                </div>
            </div>

            {mode === 'learn' && (
                <div className="animate-pop-in">
                    {lockout ? (
                        <div className="stat-card" style={{ textAlign: 'center', border: '2px solid #ff4b4b', background: '#fff5f5' }}>
                            <h3 style={{ color: '#ff4b4b' }}>Lesson Locked!</h3>
                            <p>{lockout.message}</p>
                            <h1 style={{ fontSize: '3rem', margin: '20px 0' }}>{Math.floor(lockout.remainingSeconds / 60)}:{String(lockout.remainingSeconds % 60).padStart(2, '0')}</h1>
                            <p>Please review the materials carefully before trying again.</p>
                        </div>
                    ) : (
                        <>
                            {lesson.type !== 'Text' && (
                                <>
                                    <h1 className="title" style={{ fontSize: '1.5rem', marginBottom: '20px' }}>{lesson.title}</h1>
                                    <div className="video-wrapper">
                                        {videoId && (
                                            <iframe
                                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        )}
                                    </div>
                                    <style jsx>{`
                                        .video-wrapper {
                                            position: relative;
                                            padding-bottom: 56.25%;
                                            height: 0;
                                            overflow: hidden;
                                            border-radius: 16px;
                                            margin-bottom: 24px;
                                            background: black;
                                        }

                                        @media (max-width: 768px) {
                                            .video-wrapper {
                                                width: 100vw;
                                                position: relative;
                                                left: 50%;
                                                right: 50%;
                                                margin-left: -50vw;
                                                margin-right: -50vw;
                                                border-radius: 0;
                                                padding-bottom: 0;
                                                height: auto;
                                                aspect-ratio: 16 / 9;
                                            }
                                        }
                                    `}</style>
                                </>
                            )}

                            {/* Text Lesson Content (Duolingo Style Card) */}
                            {lesson.type === 'Text' && (
                                <div className="stat-card" style={{
                                    marginBottom: '32px',
                                    padding: '40px',
                                    border: '2px solid #e5e5e5',
                                    borderRadius: '20px',
                                    boxShadow: '0 4px 0 #e5e5e5'
                                }}>
                                    <h1 className="title" style={{ fontSize: '2rem', marginBottom: '24px', textAlign: 'center' }}>{lesson.title}</h1>
                                    <div
                                        className="lesson-text-content"
                                        style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#4b4b4b' }}
                                        dangerouslySetInnerHTML={{ __html: parseCustomMarkdown(lesson.textContent || '') }}
                                    ></div>
                                </div>
                            )}

                            {/* Summary Section (For Video Lessons mostly, or supplementary for Text) */}
                            {lesson.type !== 'Text' && (
                                <div className="stat-card" style={{ marginBottom: '32px' }}>
                                    <h3 style={{ marginBottom: '12px' }}>Summary</h3>
                                    <p style={{ lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: parseCustomMarkdown(lesson.summary) }}></p>
                                </div>
                            )}

                            {/* Sticky Action Bar for Mobile/Desktop Uniformity */}
                            <div className="mobile-sticky-spacer"></div>
                            <div className="mobile-sticky-bottom">
                                {!quizCompleted && watchTimer > 0 ? (
                                    <div style={{ width: '100%', maxWidth: '600px' }}>
                                        <button className="btn btn-outline" disabled style={{ background: '#e5e5e5', color: '#afafaf', borderColor: '#e5e5e5', cursor: 'not-allowed', width: '100%' }}>
                                            QUIZ UNLOCKS IN {Math.floor(watchTimer / 60)}:{String(watchTimer % 60).padStart(2, '0')}
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ width: '100%', maxWidth: '600px' }}>
                                        <button className="btn btn-primary" onClick={() => setMode('quiz')}>
                                            {lesson.type === 'Text' ? 'CONTINUE' : 'TAKE QUIZ'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {mode === 'quiz' && !quizCompleted && (
                <div className="animate-pop-in">
                    <h2 className="title" style={{ textAlign: 'center', marginBottom: '32px' }}>Quiz Time!</h2>
                    <div className="stat-card" style={{ padding: '32px' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>
                            {lesson.quiz.questions[currentQuestionIndex].question}
                        </h3>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {lesson.quiz.questions[currentQuestionIndex].options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(idx)}
                                    disabled={selectedOption !== null}
                                    style={{
                                        padding: '16px',
                                        border: selectedOption === idx
                                            ? (idx === lesson.quiz.questions[currentQuestionIndex].correctAnswer ? '2px solid #58cc02' : '2px solid #ff4b4b')
                                            : '2px solid #e5e5e5',
                                        background: selectedOption === idx
                                            ? (idx === lesson.quiz.questions[currentQuestionIndex].correctAnswer ? '#dfffd6' : '#ffe5e5')
                                            : 'white',
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                    {selectedOption !== null && (
                        <div className="animate-pop-in" style={{
                            position: 'fixed', bottom: 0, left: 0, right: 0,
                            background: feedback === 'correct' ? '#d7ffb8' : '#ffdfe0',
                            padding: '24px',
                            borderTop: '2px solid rgba(0,0,0,0.1)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            zIndex: 200
                        }}>
                            <div>
                                <h3 style={{ color: feedback === 'correct' ? '#58cc02' : '#ff4b4b', marginBottom: '4px' }}>
                                    {feedback === 'correct' ? 'Nicely done!' : 'Not quite right...'}
                                </h3>
                            </div>
                            <button className={`btn ${feedback === 'correct' ? 'btn-primary' : 'btn-outline'}`} style={{ width: 'auto', background: feedback === 'incorrect' ? '#ff4b4b' : undefined, color: feedback === 'incorrect' ? 'white' : undefined, border: 'none' }} onClick={handleNextQuestion}>
                                {currentQuestionIndex + 1 === lesson.quiz.questions.length ? 'FINISH' : 'CONTINUE'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {quizCompleted && (
                <div className="animate-pop-in" style={{ textAlign: 'center', padding: '40px' }}>
                    {!quizSuccess ? (
                        <>
                            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>💔</div>
                            <h2 className="title" style={{ color: '#ff4b4b' }}>Lesson Failed</h2>
                            <p className="subtitle" style={{ marginBottom: '20px' }}>You scored {score}/{lesson.quiz.questions.length}. To pass, you need a perfect score.</p>

                            <p style={{ color: '#666', marginBottom: '32px' }}>Don't worry! Review the material and try again.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
                                <button className="btn btn-primary" style={{ width: '100%', maxWidth: '300px' }} onClick={() => {
                                    setMode('learn');
                                    setQuizCompleted(false);
                                    setCurrentQuestionIndex(0);
                                    setScore(0);
                                    setFeedback(null);
                                    setSelectedOption(null);
                                }}>
                                    RETAKE LESSON
                                </button>

                                <Link href={`/learning/${courseId}`} className="btn btn-outline" style={{ width: '100%', maxWidth: '300px', border: '2px solid #e5e5e5', color: '#afafaf', background: 'white' }}>
                                    GO TO MAP
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
                            <h2 className="title">Lesson Complete!</h2>
                            <p className="subtitle">You scored {score}/{lesson.quiz.questions.length}</p>

                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', margin: '20px 0' }}>
                                <div className="stat-card" style={{ width: 'auto', display: 'inline-block', minWidth: '120px', border: '2px solid #ffbd00' }}>
                                    <h3 style={{ color: '#ffbd00' }}>+{xpGained} XP</h3>
                                </div>
                                {streakUpdated && (
                                    <div className="stat-card" style={{ width: 'auto', display: 'inline-block', minWidth: '120px', border: '2px solid #ff9600' }}>
                                        <h3 style={{ color: '#ff9600' }}>Streak! 🔥</h3>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
                                {nextLessonId ? (
                                    <Link href={`/learning/${courseId}/lesson/${nextLessonId}`} className="btn btn-primary" style={{ width: 'auto' }}>
                                        NEXT LESSON
                                    </Link>
                                ) : (
                                    <div style={{ padding: '10px', color: '#888', fontStyle: 'italic' }}>
                                        Course Complete!
                                    </div>
                                )}

                                <Link href={`/learning/${courseId}`} className="btn btn-outline" style={{ width: 'auto', border: '2px solid #e5e5e5', color: '#afafaf', background: 'white' }}>
                                    GO TO MAP
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div >
    );
}
