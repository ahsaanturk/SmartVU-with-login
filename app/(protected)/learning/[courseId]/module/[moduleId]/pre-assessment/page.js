
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
        fetch(`/api/modules/${moduleId}`)
            .then(res => res.json())
            .then(data => {
                if (data.module) {
                    setModule(data.module);
                }
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, [moduleId]);

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
            setScore(newScore); // Update state for next render flow checks if needed (though state update is async)
        } else {
            // End of Quiz
            setShowResult(true);
        }
    };

    if (loading) return <div className="page-container">Loading Quiz...</div>;

    // No Quiz Found
    if (!module?.preAssessment?.questions?.length) {
        return (
            <div className="page-container" style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>No Pre-assessment Available</h2>
                <button onClick={() => router.push(`/learning/${courseId}`)} className="btn btn-primary">Go Back</button>
            </div>
        );
    }

    const questions = module.preAssessment.questions;
    const totalQuestions = questions.length;
    const passingScore = Math.ceil(totalQuestions * (module.preAssessment.passingPercentage / 100));
    const passed = score >= passingScore;

    if (showResult) {
        return (
            <div className="page-container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', paddingTop: '50px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
                    {passed ? '🎉' : '📚'}
                </div>
                <h1 style={{ color: passed ? '#58cc02' : '#ff4b4b', marginBottom: '10px' }}>
                    {passed ? 'Module Unlocked!' : 'Keep Practicing'}
                </h1>
                <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
                    You got {score} out of {totalQuestions} correct.
                    {passed ? " You're ready to jump ahead!" : " You need to review the material first."}
                </p>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    {passed ? (
                        <button
                            className="btn btn-primary"
                            onClick={() => router.push(`/learning/${courseId}`)} // Ideally navigate to specific lesson?
                        >
                            CONTINUE
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={() => window.location.reload()}
                        >
                            TRY AGAIN
                        </button>
                    )}
                    <button
                        className="btn btn-outline"
                        onClick={() => router.push(`/learning/${courseId}`)}
                    >
                        BACK TO COURSE
                    </button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / totalQuestions) * 100;

    return (
        <div className="page-container" style={{ maxWidth: '700px', margin: '0 auto', paddingTop: '40px' }}>
            {/* Progress Bar */}
            <div style={{ width: '100%', height: '16px', background: '#e5e5e5', borderRadius: '8px', marginBottom: '40px' }}>
                <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: '#58cc02',
                    borderRadius: '8px',
                    transition: 'width 0.3s ease'
                }}></div>
            </div>

            <h2 style={{ marginBottom: '32px', fontSize: '1.5rem', color: '#333' }}>
                {currentQ.question}
            </h2>

            <div style={{ display: 'grid', gap: '16px', marginBottom: '40px' }}>
                {currentQ.options.map((option, idx) => {
                    let borderColor = '#e5e5e5';
                    let bgColor = 'white';

                    if (isAnswerChecked) {
                        if (idx === currentQ.correctAnswer) {
                            borderColor = '#58cc02';
                            bgColor = '#ddf4ff'; // Light Green
                            // Wait, green is success.
                            bgColor = '#d7ffb8';
                        } else if (idx === selectedOption) {
                            borderColor = '#ff4b4b';
                            bgColor = '#ffdfe0';
                        }
                    } else if (selectedOption === idx) {
                        borderColor = '#1cb0f6';
                        bgColor = '#ddf4ff';
                    }

                    return (
                        <div
                            key={idx}
                            onClick={() => !isAnswerChecked && setSelectedOption(idx)}
                            style={{
                                padding: '20px',
                                border: `2px solid ${borderColor}`,
                                borderRadius: '16px',
                                cursor: isAnswerChecked ? 'default' : 'pointer',
                                background: bgColor,
                                fontSize: '1.1rem',
                                transition: 'all 0.2s',
                                fontWeight: selectedOption === idx ? 'bold' : 'normal'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{
                                    border: `2px solid ${borderColor}`,
                                    width: '24px', height: '24px',
                                    borderRadius: '6px', marginRight: '16px',
                                    fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                {option}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer / Action Button */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                padding: '20px',
                background: 'white',
                borderTop: '2px solid #e5e5e5',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <div style={{ maxWidth: '700px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {!isAnswerChecked ? (
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={selectedOption === null}
                            onClick={handleCheck}
                        >
                            CHECK
                        </button>
                    ) : (
                        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'spaceBetween', gap: '20px' }}>
                            <div style={{ flex: 1 }}>
                                {selectedOption === currentQ.correctAnswer ? (
                                    <div style={{ display: 'flex', alignItems: 'center', color: '#58cc02', fontWeight: 'bold' }}>
                                        <span style={{ fontSize: '2rem', marginRight: '10px' }}>✅</span>
                                        <span>Correct!</span>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', color: '#ff4b4b', fontWeight: 'bold' }}>
                                        <span style={{ fontSize: '2rem', marginRight: '10px' }}>❌</span>
                                        <span>Correct: {currentQ.options[currentQ.correctAnswer]}</span>
                                    </div>
                                )}
                            </div>
                            <button className="btn btn-primary" onClick={handleNext}>
                                CONTINUE
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
