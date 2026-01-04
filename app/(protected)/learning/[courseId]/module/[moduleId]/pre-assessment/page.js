'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function PreAssessmentPage({ params }) {
    const unwrapParams = use(params);
    const { courseId, moduleId } = unwrapParams;
    const router = useRouter();

    const [module, setModule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    // Fetch Module & Quiz
    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch(`/api/modules/${moduleId}`).then(res => res.json()),
            fetch(`/api/courses/${courseId}/progress`).then(res => res.json())
        ]).then(([moduleData, progressData]) => {
            if (moduleData.module) {
                setModule(moduleData.module);
            }

            // Check if already unlocked
            if (progressData.progress && progressData.progress.unlockedModules.includes(moduleId)) {
                alert("You have already passed this assessment!");
                router.push(`/learning/${courseId}`);
                return;
            }

            setLoading(false);
        }).catch(err => setLoading(false));
    }, [moduleId, courseId]);

    const handleCheck = () => {
        if (selectedOption === null) return;
        setIsAnswerChecked(true);
    };

    const handleNext = () => {
        const questions = module?.preAssessment?.questions || [];
        const currentQ = questions[currentQuestionIndex];

        // Calculate Score (Simple: 1 point per correct answer)
        let newScore = score;
        if (selectedOption === currentQ.correctAnswer) {
            newScore = score + 1;
            setScore(newScore);
        }

        if (currentQuestionIndex + 1 < questions.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setIsAnswerChecked(false);
            setScore(newScore);
        } else {
            // End of Quiz - Update Score Final State
            setScore(newScore);
            setShowResult(true);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem', color: '#ccc' }}>Loading...</div>;

    // No Quiz Found
    if (!module?.preAssessment?.questions?.length) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <h2>No Pre-assessment Available</h2>
                <button onClick={() => router.push(`/learning/${courseId}`)} className="btn btn-primary">Back to Course</button>
            </div>
        );
    }

    const questions = module.preAssessment.questions;
    const totalQuestions = questions.length;
    // Calculate passing score explicitly
    const passingScore = Math.ceil(totalQuestions * (module.preAssessment.passingPercentage / 100));
    // The 'passed' state needs to be calculated from the FINAL score state which might be pending in a closure if we rely on 'score' variable directly after setScore.
    // However, handleNext logic for 'else' block updates state.
    // It's safer to use the 'score' render variable in the result view.

    const passed = score >= passingScore;
    const currentQ = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / totalQuestions) * 100;

    if (showResult) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <div style={{ fontSize: '6rem', marginBottom: '20px' }}>
                    {passed ? '🎉' : '📚'}
                </div>
                <h1 style={{ color: passed ? '#58cc02' : '#ff4b4b', marginBottom: '16px', fontSize: '2.5rem', textAlign: 'center' }}>
                    {passed ? 'Module Unlocked!' : 'Don\'t give up!'}
                </h1>
                <p style={{ fontSize: '1.2rem', marginBottom: '40px', color: '#777', textAlign: 'center', maxWidth: '500px' }}>
                    You got <strong style={{ color: passed ? '#58cc02' : '#ff4b4b' }}>{score}</strong> out of <strong>{totalQuestions}</strong> correct.
                    {passed ? ` Awesome job! You've unlocked the next module and earned ${score * 10} XP!` : " Review the material and try again to unlock the next steps."}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '300px' }}>
                    {passed ? (
                        <button
                            className="btn"
                            style={{
                                background: '#58cc02', color: 'white', padding: '16px 0', borderRadius: '16px', fontSize: '1rem', fontWeight: 'bold', border: 'none', boxShadow: '0 4px 0 #46a302', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px'
                            }}
                            onClick={async () => {
                                // Call Unlock API
                                try {
                                    const res = await fetch(`/api/modules/${moduleId}/unlock`, {
                                        method: 'POST',
                                        body: JSON.stringify({ courseId, passed: true, score: score }),
                                        headers: { 'Content-Type': 'application/json' }
                                    });

                                    if (!res.ok) {
                                        throw new Error('Failed to unlock');
                                    }

                                    // Redirect to Course Map to see unlocked state
                                    router.push(`/learning/${courseId}`);
                                } catch (err) {
                                    alert("Connection failed. Please try again.");
                                }
                            }}
                        >
                            CONTINUE TO COURSE
                        </button>
                    ) : (
                        <button
                            className="btn"
                            style={{
                                background: '#1cb0f6', color: 'white', padding: '16px 0', borderRadius: '16px', fontSize: '1rem', fontWeight: 'bold', border: 'none', boxShadow: '0 4px 0 #1899d6', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px'
                            }}
                            onClick={() => window.location.reload()}
                        >
                            TRY AGAIN
                        </button>
                    )}
                    <button
                        className="btn"
                        style={{
                            background: 'transparent', color: '#afafaf', padding: '16px 0', borderRadius: '16px', fontSize: '1rem', fontWeight: 'bold', border: '2px solid #e5e5e5', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px'
                        }}
                        onClick={() => router.push(`/learning/${courseId}`)}
                    >
                        BACK TO HOME
                    </button>
                </div>
            </div >
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#fff',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Top Bar with Progress */}
            <div style={{
                padding: '40px 20px 20px',
                maxWidth: '1000px',
                margin: '0 auto',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '24px'
            }}>
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#e5e5e5' }}>✕</button>
                <div style={{ flex: 1, height: '16px', background: '#e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: '#58cc02',
                        borderRadius: '8px',
                        transition: 'width 0.3s ease'
                    }}></div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                maxWidth: '600px',
                margin: '0 auto',
                width: '100%',
                padding: '20px'
            }}>
                <h2 style={{
                    marginBottom: '40px',
                    fontSize: '1.8rem',
                    color: '#3c3c3c',
                    lineHeight: '1.4',
                    textAlign: 'left'
                }}>
                    {currentQ.question}
                </h2>

                <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr' }}>
                    {currentQ.options.map((option, idx) => {
                        let borderColor = '#e5e5e5';
                        let bgColor = 'white';
                        let boxShadow = '0 2px 0 #e5e5e5';

                        // Interaction Logic
                        if (isAnswerChecked) {
                            if (idx === currentQ.correctAnswer) {
                                borderColor = '#58cc02';
                                bgColor = '#dfffd6'; // Light Green
                                boxShadow = '0 0 0 1px #58cc02'; // simplified result state
                            } else if (idx === selectedOption) {
                                borderColor = '#ff4b4b';
                                bgColor = '#ffdfe0';
                                boxShadow = '0 0 0 1px #ff4b4b';
                            }
                        } else if (selectedOption === idx) {
                            borderColor = '#84d8ff';
                            bgColor = '#ddf4ff';
                            boxShadow = '0 2px 0 #1899d6';
                        }

                        return (
                            <div
                                key={idx}
                                onClick={() => !isAnswerChecked && setSelectedOption(idx)}
                                style={{
                                    padding: '16px 20px',
                                    border: `2px solid ${borderColor}`,
                                    borderRadius: '16px',
                                    cursor: isAnswerChecked ? 'default' : 'pointer',
                                    background: bgColor,
                                    fontSize: '1.1rem',
                                    fontWeight: '500',
                                    color: '#4b4b4b',
                                    transition: 'all 0.1s',
                                    boxShadow: boxShadow,
                                    transform: selectedOption === idx && !isAnswerChecked ? 'translateY(1px)' : 'none',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <span style={{
                                    border: `2px solid ${borderColor}`,
                                    width: '30px', height: '30px',
                                    borderRadius: '8px', marginRight: '20px',
                                    fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: borderColor === '#e5e5e5' ? '#e5e5e5' : borderColor,
                                    fontWeight: 'bold'
                                }}>
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                {option}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer / Action Button Area */}
            <div style={{
                padding: '40px 20px',
                borderTop: '2px solid #e5e5e5',
                background: isAnswerChecked ? (selectedOption === currentQ.correctAnswer ? '#d7ffb8' : '#ffdfe0') : 'white'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                    {isAnswerChecked ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', animation: 'fadeIn 0.3s' }}>
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '50%',
                                background: selectedOption === currentQ.correctAnswer ? '#58cc02' : '#ff4b4b',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: '2rem'
                            }}>
                                {selectedOption === currentQ.correctAnswer ? '✓' : '✕'}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, color: selectedOption === currentQ.correctAnswer ? '#58cc02' : '#ff4b4b', fontSize: '1.5rem' }}>
                                    {selectedOption === currentQ.correctAnswer ? 'Correct!' : 'Correct Solution:'}
                                </h3>
                                {selectedOption !== currentQ.correctAnswer && (
                                    <p style={{ margin: '4px 0 0', color: '#ff4b4b' }}>
                                        {currentQ.options[currentQ.correctAnswer]}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div></div> // Spacer
                    )}

                    <button
                        className="btn"
                        style={{
                            width: isAnswerChecked ? 'auto' : '100%',
                            minWidth: isAnswerChecked ? '150px' : 'auto',
                            maxWidth: isAnswerChecked ? 'none' : '600px', // constrain wide button on desktop
                            background: selectedOption === null ? '#e5e5e5' : (isAnswerChecked ? (selectedOption === currentQ.correctAnswer ? '#58cc02' : '#ff4b4b') : '#58cc02'),
                            color: selectedOption === null ? '#afafaf' : 'white',
                            border: 'none',
                            padding: '16px 32px',
                            borderRadius: '16px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: selectedOption === null ? 'not-allowed' : 'pointer',
                            boxShadow: selectedOption === null ? 'none' : `0 4px 0 ${isAnswerChecked ? (selectedOption === currentQ.correctAnswer ? '#46a302' : '#ea2b2b') : '#46a302'}`,
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            transition: 'all 0.2s',
                        }}
                        disabled={selectedOption === null}
                        onClick={isAnswerChecked ? handleNext : handleCheck}
                    >
                        {isAnswerChecked ? 'Continue' : 'Check'}
                    </button>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
