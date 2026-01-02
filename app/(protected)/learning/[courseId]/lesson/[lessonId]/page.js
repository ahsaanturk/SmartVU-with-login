
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
    const [feedback, setFeedback] = useState(null); // 'correct' or 'incorrect'

    useEffect(() => {
        fetch(`/api/lessons/${lessonId}`)
            .then(res => res.json())
            .then(data => {
                if (data.lesson) setLesson(data.lesson);
                setLoading(false);
            });
    }, [lessonId]);

    const getYoutubeId = (url) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleOptionSelect = (idx) => {
        if (selectedOption !== null) return; // Prevent double clicking
        setSelectedOption(idx);

        const currentQ = lesson.quiz.questions[currentQuestionIndex];
        if (idx === currentQ.correctAnswer) {
            setFeedback('correct');
            // Play sound effect could go here
        } else {
            setFeedback('incorrect');
        }
    };

    const handleNextQuestion = async () => {
        if (feedback === 'correct') {
            setScore(score + 1);
        }

        if (currentQuestionIndex + 1 < lesson.quiz.questions.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setFeedback(null);
        } else {
            setQuizCompleted(true);
            // Call API to mark complete and update streak
            try {
                await fetch('/api/lessons/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lessonId })
                });
            } catch (err) {
                console.error('Failed to update progress', err);
            }
        }
    };

    if (loading) return <div className="page-container">Loading lesson...</div>;
    if (!lesson) return <div className="page-container">Lesson not found</div>;

    const videoId = getYoutubeId(lesson.videoUrl);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            {/* Header */}
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link href={`/learning/${courseId}`} style={{ color: 'var(--text-muted)', fontSize: '1.5rem', textDecoration: 'none' }}>
                    ✕
                </Link>
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
                    <h1 className="title" style={{ fontSize: '1.5rem', marginBottom: '20px' }}>{lesson.title}</h1>

                    {/* Video Player */}
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '16px', marginBottom: '24px', background: 'black' }}>
                        {videoId ? (
                            <iframe
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                Invalid Video URL
                            </div>
                        )}
                    </div>

                    <div className="stat-card" style={{ marginBottom: '32px' }}>
                        <h3 style={{ marginBottom: '12px' }}>Summary</h3>
                        <p style={{ lineHeight: '1.6' }}>{lesson.summary}</p>
                    </div>

                    <button className="btn btn-primary" onClick={() => setMode('quiz')}>
                        TAKE QUIZ
                    </button>
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
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
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
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
                    <h2 className="title">Lesson Complete!</h2>
                    <p className="subtitle">You scored {score} out of {lesson.quiz.questions.length}</p>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
                        <button className="btn btn-outline" style={{ width: 'auto' }} onClick={() => window.location.reload()}>RETRY</button>
                        <Link href={`/learning/${courseId}`} className="btn btn-primary" style={{ width: 'auto' }}>
                            CONTINUE
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
