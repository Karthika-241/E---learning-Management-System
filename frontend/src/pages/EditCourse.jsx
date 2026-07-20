import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { api } from "../api/client";
import { useCurrentUser } from "../context/CurrentUserContext";
import Spinner from "../components/Spinner";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

let uid = 0;
const nextId = () => `tmp-${++uid}`;

function emptyLecture() {
  return { key: nextId(), title: "", duration_minutes: 5, is_preview: false, video_url: "" };
}
function emptySection() {
  return { key: nextId(), title: "", lectures: [emptyLecture()] };
}

export default function EditCourse() {
  const { id } = useParams();
  const { currentUser } = useCurrentUser();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    level: "Beginner",
    price: 0,
    category_id: "",
    thumbnail_seed: "",
  });
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      api.getCourse(id, currentUser.id),
      api.listCategories(),
      api.getAllQuestions(id),
    ]).then(([course, cats, q]) => {
      setCategories(cats);
      setForm({
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        level: course.level,
        price: course.price,
        category_id: course.category?.id ?? "",
        thumbnail_seed: course.thumbnail_seed,
      });
      setSections(
        course.sections.map((s) => ({
          id: s.id,
          key: nextId(),
          title: s.title,
          lectures: s.lectures.map((l) => ({
            id: l.id,
            key: nextId(),
            title: l.title,
            duration_minutes: l.duration_minutes,
            is_preview: l.is_preview,
            video_url: l.video_url,
          })),
        }))
      );
      setQuestions(q.map((question) => ({ ...question, key: nextId() })));
    }).finally(() => setLoading(false));
  }, [id, currentUser]);

  if (loading) return <Spinner label="Loading course…" />;
  if (currentUser && currentUser.role !== "instructor") {
    return <Navigate to="/become-instructor" replace />;
  }

  function updateSection(key, patch) {
    setSections((secs) => secs.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  }
  function updateLecture(sectionKey, lecKey, patch) {
    setSections((secs) =>
      secs.map((s) =>
        s.key !== sectionKey
          ? s
          : { ...s, lectures: s.lectures.map((l) => (l.key === lecKey ? { ...l, ...patch } : l)) }
      )
    );
  }

  function updateQuestion(key, patch) {
    setQuestions((qs) => qs.map((q) => (q.key === key ? { ...q, ...patch } : q)));
  }

  async function saveQuestion(q) {
    const payload = {
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
    };
    if (q.id) {
      const updated = await api.updateQuestion(id, q.id, payload);
      setQuestions((qs) => qs.map((q2) => (q2.key === q.key ? { ...updated, key: q.key } : q2)));
    } else {
      const created = await api.createQuestion(id, payload);
      setQuestions((qs) => qs.map((q2) => (q2.key === q.key ? { ...created, key: q.key } : q2)));
    }
  }

  async function removeQuestion(q) {
    if (q.id) {
      await api.deleteQuestion(id, q.id);
    }
    setQuestions((qs) => qs.filter((q2) => q2.key !== q.key));
  }

  function addQuestion() {
    setQuestions((qs) => [
      ...qs,
      {
        key: nextId(),
        id: null,
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_option: "a",
      },
    ]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) return setError("Give your course a title.");

    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        category_id: form.category_id ? Number(form.category_id) : undefined,
        sections: sections
          .filter((s) => s.title.trim())
          .map((s, sIdx) => ({
            title: s.title,
            order: sIdx,
            lectures: s.lectures
              .filter((l) => l.title.trim())
              .map((l, lIdx) => ({
                title: l.title,
                duration_minutes: Number(l.duration_minutes) || 5,
                order: lIdx,
                is_preview: l.is_preview,
                video_url: l.video_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              })),
          })),
      };
      await api.updateCourse(id, payload);
      navigate(`/instructor`);
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't update the course. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl font-bold mb-1">Edit course</h1>
      <p className="text-ash text-sm mb-6">Update course details, curriculum, and video URLs.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Course title
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Advanced Excel for Data Analysis"
              className="rounded-xl border border-ink/15 px-4 py-2.5 font-normal focus:border-jade focus:ring-2 focus:ring-jade/10 transition-all" />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Subtitle
            <input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              placeholder="One line that sells the course"
              className="rounded-xl border border-ink/15 px-4 py-2.5 font-normal focus:border-jade focus:ring-2 focus:ring-jade/10 transition-all" />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Description
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="rounded-xl border border-ink/15 px-4 py-2.5 font-normal min-h-[120px] focus:border-jade focus:ring-2 focus:ring-jade/10 transition-all resize-y" />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Thumbnail seed
            <input value={form.thumbnail_seed} onChange={(e) => setForm((f) => ({ ...f, thumbnail_seed: e.target.value }))}
              placeholder="Random string for the course thumbnail"
              className="rounded-xl border border-ink/15 px-4 py-2.5 font-normal focus:border-jade focus:ring-2 focus:ring-jade/10 transition-all" />
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Category
              <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                className="rounded-xl border border-ink/15 px-4 py-2.5 font-normal focus:border-jade focus:ring-2 focus:ring-jade/10 transition-all bg-white">
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Level
              <select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                className="rounded-xl border border-ink/15 px-4 py-2.5 font-normal focus:border-jade focus:ring-2 focus:ring-jade/10 transition-all bg-white">
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Price (₹, 0 = free)
              <input type="number" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="rounded-xl border border-ink/15 px-4 py-2.5 font-normal focus:border-jade focus:ring-2 focus:ring-jade/10 transition-all" />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg">Curriculum</h2>
              <p className="text-xs text-ash">Sections and lectures for your course</p>
            </div>
            <button type="button" onClick={() => setSections((s) => [...s, emptySection()])}
              className="text-sm text-jade-dark font-medium hover:bg-jade-light px-4 py-2 rounded-full transition-colors">
              + Add section
            </button>
          </div>

          {sections.map((section, sIdx) => (
            <div key={section.key} className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-jade-light text-jade-dark rounded-full px-2 py-0.5 font-medium">S{sIdx + 1}</span>
                <input value={section.title} onChange={(e) => updateSection(section.key, { title: e.target.value })}
                  placeholder="Section title, e.g. Getting Started"
                  className="flex-1 rounded-xl border border-ink/15 px-3 py-2 text-sm focus:border-jade focus:ring-2 focus:ring-jade/10 transition-all" />
                {sections.length > 1 && (
                  <button type="button" onClick={() => setSections((secs) => secs.filter((s) => s.key !== section.key))}
                    className="text-xs text-ash hover:text-red-500 transition-colors">Remove</button>
                )}
              </div>

              <div className="flex flex-col gap-2 pl-4">
                {section.lectures.map((lec, lIdx) => (
                  <div key={lec.key} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-ash w-8 shrink-0">{sIdx + 1}.{lIdx + 1}</span>
                      <input value={lec.title} onChange={(e) => updateLecture(section.key, lec.key, { title: e.target.value })}
                        placeholder="Lecture title"
                        className="flex-1 rounded-lg border border-ink/15 px-3 py-1.5 text-sm focus:border-jade focus:ring-2 focus:ring-jade/10 transition-all" />
                      <input type="number" min="1" value={lec.duration_minutes}
                        onChange={(e) => updateLecture(section.key, lec.key, { duration_minutes: e.target.value })}
                        className="w-16 rounded-lg border border-ink/15 px-2 py-1.5 text-sm focus:border-jade focus:ring-2 focus:ring-jade/10 transition-all" title="Duration in minutes" />
                      <label className="flex items-center gap-1.5 text-xs text-ash shrink-0 cursor-pointer select-none hover:text-ink transition-colors">
                        <input type="checkbox" checked={lec.is_preview}
                          onChange={(e) => updateLecture(section.key, lec.key, { is_preview: e.target.checked })}
                          className="rounded border-ink/30 text-jade focus:ring-jade/20" />
                        Preview
                      </label>
                      {section.lectures.length > 1 && (
                        <button type="button" onClick={() => updateSection(section.key, { lectures: section.lectures.filter((l) => l.key !== lec.key) })}
                          className="text-sm text-ash hover:text-red-500 transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50">✕</button>
                      )}
                    </div>
                    <input value={lec.video_url}
                      onChange={(e) => updateLecture(section.key, lec.key, { video_url: e.target.value })}
                      placeholder="YouTube or direct video URL (e.g. https://youtu.be/...)"
                      className="ml-10 rounded-lg border border-ink/15 px-3 py-1.5 text-sm focus:border-jade focus:ring-2 focus:ring-jade/10 transition-all" />
                  </div>
                ))}
                <button type="button" onClick={() => updateSection(section.key, { lectures: [...section.lectures, emptyLecture()] })}
                  className="self-start text-xs text-jade-dark font-medium hover:bg-jade-light px-3 py-1.5 rounded-full transition-colors">
                  + Add lecture
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg">Assessment Questions</h2>
              <p className="text-xs text-ash">Questions students will answer after completing all lectures</p>
            </div>
            <button type="button" onClick={addQuestion}
              className="text-sm text-jade-dark font-medium hover:bg-jade-light px-4 py-2 rounded-full transition-colors">
              + Add question
            </button>
          </div>

          {questions.map((q, qIdx) => (
            <div key={q.key} className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-jade-light text-jade-dark rounded-full px-2 py-0.5 font-medium">Q{qIdx + 1}</span>
                <input value={q.question_text}
                  onChange={(e) => updateQuestion(q.key, { question_text: e.target.value })}
                  placeholder="Question text"
                  className="flex-1 rounded-xl border border-ink/15 px-3 py-2 text-sm focus:border-jade focus:ring-2 focus:ring-jade/10 transition-all" />
                <select value={q.correct_option}
                  onChange={(e) => updateQuestion(q.key, { correct_option: e.target.value })}
                  className="w-28 rounded-lg border border-ink/15 px-2 py-1.5 text-sm focus:border-jade focus:ring-2 focus:ring-jade/10 transition-all bg-white"
                  title="Correct answer">
                  <option value="a">A is correct</option>
                  <option value="b">B is correct</option>
                  <option value="c">C is correct</option>
                  <option value="d">D is correct</option>
                </select>
                <button type="button" onClick={() => removeQuestion(q)}
                  className="text-sm text-ash hover:text-red-500 transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50">✕</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                {["a", "b", "c", "d"].map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shrink-0 ${q.correct_option === opt ? "bg-jade text-white" : "bg-ink/10 text-ash"}`}>
                      {opt.toUpperCase()}
                    </span>
                    <input value={q[`option_${opt}`]}
                      onChange={(e) => updateQuestion(q.key, { [`option_${opt}`]: e.target.value })}
                      placeholder={`Option ${opt.toUpperCase()}`}
                      className="flex-1 rounded-lg border border-ink/15 px-3 py-1.5 text-sm focus:border-jade focus:ring-2 focus:ring-jade/10 transition-all" />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => saveQuestion(q)}
                  className="text-xs font-medium text-white bg-jade hover:bg-jade-dark px-4 py-1.5 rounded-full transition-colors">
                  {q.id ? "Update" : "Save"}
                </button>
              </div>
            </div>
          ))}

          {questions.length === 0 && (
            <p className="text-sm text-ash text-center py-4">No questions yet. Add some to create the assessment.</p>
          )}
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="bg-jade hover:bg-jade-dark transition-all disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-full shadow-lg shadow-jade/20 hover:scale-105 active:scale-95">
            {saving ? "Saving…" : "Save changes →"}
          </button>
          <button type="button" onClick={() => navigate("/instructor")}
            className="bg-ink/10 hover:bg-ink/20 transition-colors text-ink font-semibold px-6 py-3 rounded-full">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
