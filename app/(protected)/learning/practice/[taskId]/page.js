
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PracticeQuizPage({ params }) {
    const unwrapParams = use(params);
    const { taskId } = unwrapParams;
    const router = useRouter();

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);

    // Quiz State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // Map { index: choiceIndex }
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [result, setResult] = useState(null); // { score, passed, xpGained }
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetch(`/api/tasks/${taskId}`) // We need a single task fetcher
            .then(res => res.json())
            .then(data => {
                if (data.task) {
                    setTask(data.task);
                    setQuestions(data.task.quizQuestions || []);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [taskId]);

    const handleOptionSelect = (qIndex, optionIndex) => {
        setAnswers({ ...answers, [qIndex]: optionIndex });
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < questions.length) {
            if (!confirm('You have unanswered questions. Submit anyway?')) return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/practice/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskId,
                    answers
                })
            });

            const data = await res.json();
            setResult(data);
            setQuizCompleted(true);
        } catch (error) {
            console.error(error);
            alert('Failed to submit quiz');
        }
        setSubmitting(false);
    };

    if (loading) return <div className="page-container">Loading Quiz...</div>;
    if (!task) return <div className="page-container">Task not found</div>;
    if (questions.length === 0) return <div className="page-container">No questions in this quiz.</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', fontWeight: '700', marginBottom: '16px', display: 'inline-block' }}>
                ← BACK TO DASHBOARD
            </Link>

            {!quizCompleted ? (
                <div className="animate-pop-in">
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 className="title" style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{task.title}</h1>
                            <p style={{ color: 'var(--text-muted)' }}>{task.courseCode} • Practice Quiz</p>
                        </div>
                        <div style={{ background: '#e5f6fd', color: '#1cb0f6', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' }}>
                            {questions.length} Questions
                        </div>
                    </div>

                    {questions.map((q, idx) => (
                        <div key={idx} className="stat-card" style={{ marginBottom: '24px', padding: '24px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
                                <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>{idx + 1}.</span>
                                {q.question}
                            </h3>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {q.options.map((opt, optIdx) => (
                                    <button
                                        key={optIdx}
                                        onClick={() => handleOptionSelect(idx, optIdx)}
                                        style={{
                                            padding: '12px 16px',
                                            textAlign: 'left',
                                            background: answers[idx] === optIdx ? '#dfffd6' : 'white',
                                            border: answers[idx] === optIdx ? '2px solid #58cc02' : '2px solid #e5e5e5',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            fontWeight: answers[idx] === optIdx ? '600' : 'normal',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div style={{ textAlign: 'center', marginTop: '32px' }}>
                        <button
                            className="btn btn-primary"
                            style={{ width: '200px', fontSize: '1.2rem' }}
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'SUBMITTING...' : 'SUBMIT QUIZ'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="animate-pop-in" style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '16px' }}>
                        {result.passed ? '🎉' : '💪'}
                    </div>
                    <h2 className="title">{result.passed ? 'Quiz Passed!' : 'Keep Practicing'}</h2>
                    <p className="subtitle" style={{ marginBottom: '32px' }}>
                        You scored {Math.round(result.scorePercent)}% ({result.score}/{questions.length})
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
                        {result.xpGained > 0 && (
                            <div className="stat-card" style={{ width: 'auto', border: '2px solid #ffbd00' }}>
                                <h3 style={{ color: '#ffbd00' }}>+{result.xpGained} XP</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>First Time Bonus</p>
                            </div>
                        )}
                        <div className="stat-card" style={{ width: 'auto' }}>
                            <h3>{result.passed ? 'PASSED' : 'FAILED'}</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status</p>
                        </div>
                    </div>

                    <Link href="/" className="btn btn-primary" style={{ width: 'auto' }}>
                        RETURN TO DASHBOARD
                    </Link>
                </div>
            )}
        </div>
    );
}
