import { useState, useEffect, useCallback } from 'react';
import { courseService } from '../services';

function QuizSection({ courseId, isInstructor, onRefresh }) {
    const [quizzes, setQuizzes] = useState([]);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [showAddQuiz, setShowAddQuiz] = useState(false);
    const [newQuiz, setNewQuiz] = useState({
        title: '',
        description: '',
        passingScore: 70,
        questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    });

    const fetchQuizzes = useCallback(async () => {
        try {
            const response = await courseService.getQuizzes(courseId);
            setQuizzes(response.data.data.quizzes || []);
            setAttempts(response.data.data.attempts || []);
        } catch (error) {
            console.error('Failed to fetch quizzes', error);
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchQuizzes();
    }, [fetchQuizzes]);

    const handleStartQuiz = (quiz) => {
        setActiveQuiz(quiz);
        setAnswers({});
        setResult(null);
    };

    const handleAnswerSelect = (questionIndex, optionIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: optionIndex
        }));
    };

    const handleSubmitQuiz = async () => {
        if (Object.keys(answers).length !== activeQuiz.questions.length) {
            alert('Please answer all questions');
            return;
        }

        setSubmitting(true);
        try {
            const answersArray = activeQuiz.questions.map((_, idx) => ({
                questionIndex: idx,
                selectedAnswer: answers[idx]
            }));

            const response = await courseService.submitQuiz(courseId, activeQuiz._id, answersArray);
            setResult(response.data.data);
            fetchQuizzes(); // Refresh to update attempts
            if (onRefresh) onRefresh();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to submit quiz');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddQuestion = () => {
        setNewQuiz(prev => ({
            ...prev,
            questions: [...prev.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
        }));
    };

    const handleRemoveQuestion = (idx) => {
        if (newQuiz.questions.length <= 1) return;
        setNewQuiz(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== idx)
        }));
    };

    const handleQuestionChange = (idx, field, value) => {
        setNewQuiz(prev => {
            const questions = [...prev.questions];
            if (field === 'question') {
                questions[idx].question = value;
            } else if (field.startsWith('option')) {
                const optIdx = parseInt(field.replace('option', ''));
                questions[idx].options[optIdx] = value;
            } else if (field === 'correctAnswer') {
                questions[idx].correctAnswer = parseInt(value);
            }
            return { ...prev, questions };
        });
    };

    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        try {
            await courseService.addQuiz(courseId, newQuiz);
            setShowAddQuiz(false);
            setNewQuiz({
                title: '',
                description: '',
                passingScore: 70,
                questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
            });
            fetchQuizzes();
            if (onRefresh) onRefresh();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create quiz');
        }
    };

    const handleDeleteQuiz = async (quizId) => {
        if (!window.confirm('Are you sure you want to delete this quiz?')) return;
        try {
            await courseService.deleteQuiz(courseId, quizId);
            fetchQuizzes();
            if (onRefresh) onRefresh();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete quiz');
        }
    };

    const getQuizStatus = (quizId) => {
        const quizAttempts = attempts.filter(a => a.quizId === quizId);
        if (quizAttempts.length === 0) return { status: 'not-attempted', bestScore: 0 };
        const passed = quizAttempts.some(a => a.passed);
        const bestScore = Math.max(...quizAttempts.map(a => a.score));
        return { status: passed ? 'passed' : 'failed', bestScore, attempts: quizAttempts.length };
    };

    if (loading) {
        return <div className="text-center py-4">Loading quizzes...</div>;
    }

    // Active quiz view
    if (activeQuiz && !result) {
        return (
            <div className="bg-white border rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">{activeQuiz.title}</h3>
                    <button
                        onClick={() => setActiveQuiz(null)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕ Close
                    </button>
                </div>

                <div className="space-y-6">
                    {activeQuiz.questions.map((q, qIdx) => (
                        <div key={qIdx} className="border-b pb-4">
                            <p className="font-medium text-gray-800 mb-3">
                                {qIdx + 1}. {q.question}
                            </p>
                            <div className="space-y-2">
                                {q.options.map((option, oIdx) => (
                                    <label
                                        key={oIdx}
                                        className={`flex items-center p-3 rounded border cursor-pointer transition ${
                                            answers[qIdx] === oIdx
                                                ? 'bg-primary bg-opacity-10 border-primary'
                                                : 'hover:bg-gray-50 border-gray-200'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${qIdx}`}
                                            checked={answers[qIdx] === oIdx}
                                            onChange={() => handleAnswerSelect(qIdx, oIdx)}
                                            className="mr-3"
                                        />
                                        <span>{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        Answered: {Object.keys(answers).length} / {activeQuiz.questions.length}
                    </p>
                    <button
                        onClick={handleSubmitQuiz}
                        disabled={submitting || Object.keys(answers).length !== activeQuiz.questions.length}
                        className="bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded transition disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                </div>
            </div>
        );
    }

    // Quiz result view
    if (result) {
        return (
            <div className="bg-white border rounded-lg p-6 shadow-sm">
                <div className={`text-center p-6 rounded-lg mb-6 ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                    <h3 className={`text-2xl font-bold mb-2 ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
                        {result.passed ? '🎉 Congratulations! You Passed!' : '😔 Not Quite There Yet'}
                    </h3>
                    <p className="text-4xl font-bold mb-2">{result.score}%</p>
                    <p className="text-gray-600">
                        {result.correctCount} / {result.totalQuestions} correct (Passing: {result.passingScore}%)
                    </p>
                </div>

                <h4 className="font-bold text-gray-800 mb-4">Review Answers:</h4>
                <div className="space-y-4">
                    {result.answers.map((ans, idx) => (
                        <div key={idx} className={`p-4 rounded border ${ans.isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                            <p className="font-medium mb-2">
                                {ans.isCorrect ? '✅' : '❌'} Question {idx + 1}
                            </p>
                            <p className="text-sm text-gray-600">
                                Your answer: Option {ans.selectedAnswer + 1} | Correct: Option {ans.correctAnswer + 1}
                            </p>
                            {ans.explanation && (
                                <p className="text-sm text-gray-500 mt-1 italic">{ans.explanation}</p>
                            )}
                        </div>
                    ))}
                </div>

                {result.courseCompleted && (
                    <div className="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded">
                        <p className="text-yellow-800 font-bold">
                            🏆 Course Completed! You can now generate your certificate.
                        </p>
                    </div>
                )}

                <button
                    onClick={() => {
                        setActiveQuiz(null);
                        setResult(null);
                    }}
                    className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition"
                >
                    Back to Quizzes
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Course Quizzes</h3>
                {isInstructor && (
                    <button
                        onClick={() => setShowAddQuiz(true)}
                        className="bg-primary hover:bg-secondary text-white font-medium py-2 px-4 rounded transition text-sm"
                    >
                        + Add Quiz
                    </button>
                )}
            </div>

            {quizzes.length === 0 ? (
                <p className="text-gray-500 italic">No quizzes available for this course.</p>
            ) : (
                quizzes.map((quiz) => {
                    const status = getQuizStatus(quiz._id);
                    return (
                        <div key={quiz._id} className={`bg-white border p-4 rounded-lg shadow-sm ${status.status === 'passed' ? 'border-l-4 border-l-green-500' : ''}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">
                                        {status.status === 'passed' ? '✅' : status.status === 'failed' ? '📝' : '📋'}
                                    </span>
                                    <div>
                                        <h4 className="font-semibold text-lg">{quiz.title}</h4>
                                        <p className="text-sm text-gray-500">
                                            {quiz.questions?.length || 0} questions • Passing: {quiz.passingScore}%
                                            {quiz.isRequired && <span className="ml-2 text-red-500">(Required)</span>}
                                        </p>
                                        {status.status !== 'not-attempted' && (
                                            <p className={`text-sm ${status.status === 'passed' ? 'text-green-600' : 'text-orange-600'}`}>
                                                Best score: {status.bestScore}% ({status.attempts} attempt{status.attempts > 1 ? 's' : ''})
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {!isInstructor && (
                                        <button
                                            onClick={() => handleStartQuiz(quiz)}
                                            className={`px-4 py-2 rounded text-sm font-medium transition ${
                                                status.status === 'passed'
                                                    ? 'bg-green-100 hover:bg-green-200 text-green-700'
                                                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                                            }`}
                                        >
                                            {status.status === 'not-attempted' ? 'Start Quiz' : status.status === 'passed' ? 'Retake' : 'Try Again'}
                                        </button>
                                    )}
                                    {isInstructor && (
                                        <button
                                            onClick={() => handleDeleteQuiz(quiz._id)}
                                            className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded text-sm font-medium transition"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                            {quiz.description && (
                                <p className="text-gray-600 text-sm mt-2 ml-11">{quiz.description}</p>
                            )}
                        </div>
                    );
                })
            )}

            {/* Add Quiz Modal */}
            {showAddQuiz && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Create New Quiz</h2>
                                <button
                                    onClick={() => setShowAddQuiz(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleCreateQuiz}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2">Quiz Title</label>
                                    <input
                                        type="text"
                                        value={newQuiz.title}
                                        onChange={(e) => setNewQuiz(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2">Description (optional)</label>
                                    <textarea
                                        value={newQuiz.description}
                                        onChange={(e) => setNewQuiz(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
                                        rows="2"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-gray-700 font-medium mb-2">Passing Score (%)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={newQuiz.passingScore}
                                        onChange={(e) => setNewQuiz(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                                        className="w-24 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
                                    />
                                </div>

                                <h3 className="font-bold text-gray-800 mb-4">Questions</h3>
                                {newQuiz.questions.map((q, qIdx) => (
                                    <div key={qIdx} className="border rounded p-4 mb-4 bg-gray-50">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-medium">Question {qIdx + 1}</span>
                                            {newQuiz.questions.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveQuestion(qIdx)}
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Enter question"
                                            value={q.question}
                                            onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded mb-3 focus:outline-none focus:border-primary"
                                            required
                                        />
                                        <div className="space-y-2">
                                            {q.options.map((opt, oIdx) => (
                                                <div key={oIdx} className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name={`correct-${qIdx}`}
                                                        checked={q.correctAnswer === oIdx}
                                                        onChange={() => handleQuestionChange(qIdx, 'correctAnswer', oIdx)}
                                                        title="Mark as correct answer"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder={`Option ${oIdx + 1}`}
                                                        value={opt}
                                                        onChange={(e) => handleQuestionChange(qIdx, `option${oIdx}`, e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary text-sm"
                                                        required
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Select the radio button next to the correct answer</p>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={handleAddQuestion}
                                    className="w-full border-2 border-dashed border-gray-300 text-gray-500 py-3 rounded hover:border-primary hover:text-primary transition mb-6"
                                >
                                    + Add Question
                                </button>

                                <button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 rounded transition"
                                >
                                    Create Quiz
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default QuizSection;
