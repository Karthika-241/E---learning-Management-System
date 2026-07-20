import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import { useCurrentUser } from "../context/CurrentUserContext";
import Spinner from "../components/Spinner";

export default function Quiz() {
  const { id } = useParams();
  const { currentUser } = useCurrentUser();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      api.getQuestions(id),
      api.getCourse(id, currentUser.id),
    ]).then(([qs, course]) => {
      setQuestions(qs);
      setCourseTitle(course.title);
    }).finally(() => setLoading(false));
  }, [id, currentUser]);

  if (loading) return <Spinner label="Loading quiz…" />;

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <p className="text-5xl mb-4">📝</p>
        <h1 className="font-display text-xl font-bold mb-2">No questions yet</h1>
        <p className="text-ash mb-6">This course doesn't have any assessment questions.</p>
        <Link to={`/learn/${id}`} className="bg-ink text-white text-sm font-medium px-6 py-2.5 rounded-full inline-block transition-all hover:scale-105 active:scale-95">
          Back to course
        </Link>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="bg-white border border-ink/10 rounded-2xl p-10 shadow-card">
          <p className="text-7xl mb-4">{result.passed ? "🎉" : "💪"}</p>
          <h1 className="font-display text-2xl font-bold mb-2">
            {result.passed ? "Congratulations!" : "Keep trying!"}
          </h1>
          <div className="relative inline-flex items-center justify-center my-8">
            <svg className="w-32 h-32" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#E4F5F2" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={result.passed ? "#1F9D8A" : "#F2A93B"}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - result.score / result.total)}`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute font-display font-extrabold text-3xl">
              {result.score}<span className="text-lg text-ash">/{result.total}</span>
            </span>
          </div>
          <p className="text-ash mb-6">{result.message}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={`/certificate/${id}?score=${result.score}&total=${result.total}`}
              className="bg-jade hover:bg-jade-dark text-white font-semibold px-6 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-jade/20">
              🎓 View Certificate
            </Link>
            <Link to={`/learn/${id}`}
              className="bg-ink/10 hover:bg-ink/20 text-ink font-semibold px-6 py-2.5 rounded-full transition-all">
              Back to course
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const selected = answers[q.id] || "";
  const progress = ((current + 1) / questions.length) * 100;

  function selectOption(option) {
    setAnswers((prev) => ({ ...prev, [q.id]: option }));
  }

  function next() {
    if (current < questions.length - 1) setCurrent((c) => c + 1);
  }

  function prev() {
    if (current > 0) setCurrent((c) => c - 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await api.submitQuiz(id, currentUser.id, answers);
      setResult(res);
    } catch {
      alert("Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 animate-fade-in">
        <Link to={`/learn/${id}`} className="text-xs text-jade-dark font-medium hover:text-jade transition-colors mb-2 inline-flex items-center gap-1">
          ← Back to course
        </Link>
        <h1 className="font-display text-xl font-bold">{courseTitle}</h1>
        <p className="text-ash text-sm">Assessment · {questions.length} questions</p>
      </div>

      <div className="h-2 bg-ink/10 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-jade to-jade-light rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="bg-white border border-ink/10 rounded-2xl p-6 sm:p-8 shadow-card animate-fade-in" key={current}>
        <div className="flex items-start gap-3 mb-6">
          <span className="text-xs font-mono bg-jade-light text-jade-dark rounded-full px-2.5 py-1 shrink-0 mt-0.5 font-medium">
            Q{current + 1}/{questions.length}
          </span>
          <h2 className="font-medium text-lg leading-relaxed">{q.question_text}</h2>
        </div>

        <div className="flex flex-col gap-3 pl-0 sm:pl-8">
          {["a", "b", "c", "d"].map((opt) => (
            <button
              key={opt}
              onClick={() => selectOption(opt)}
              className={`text-left px-5 py-3.5 rounded-xl border-2 text-sm transition-all ${
                selected === opt
                  ? "border-jade bg-jade-light text-jade-dark font-medium shadow-sm"
                  : "border-ink/10 hover:border-ink/30 hover:bg-paper bg-white"
              }`}
            >
              <span className="font-mono text-xs mr-3 text-ash uppercase font-semibold">{opt}.</span>
              {q[`option_${opt}`]}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-8 pt-5 border-t border-ink/10">
          <button
            onClick={prev}
            disabled={current === 0}
            className="text-sm font-medium px-5 py-2 rounded-full border border-ink/15 hover:bg-paper disabled:opacity-40 transition-all"
          >
            ← Previous
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-ash font-mono">
              {Object.keys(answers).length}/{questions.length} answered
            </span>
            {current < questions.length - 1 ? (
              <button
                onClick={next}
                disabled={!selected}
                className="bg-ink text-white text-sm font-medium px-6 py-2 rounded-full disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length !== questions.length}
                className="bg-jade hover:bg-jade-dark text-white text-sm font-medium px-6 py-2 rounded-full disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
              >
                {submitting ? "Submitting…" : "Submit answers"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
