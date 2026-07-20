import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import Spinner from "../components/Spinner";
import { useCurrentUser } from "../context/CurrentUserContext";

export default function CoursePlayer() {
  const { id } = useParams();
  const { currentUser } = useCurrentUser();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLectureId, setActiveLectureId] = useState(null);

  function load() {
    setLoading(true);
    return api.getCourse(id, currentUser?.id).then((c) => {
      setCourse(c);
      setActiveLectureId((prev) => prev ?? c.sections[0]?.lectures[0]?.id ?? null);
    }).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentUser?.id]);

  const allLectures = useMemo(
    () => (course ? course.sections.flatMap((s) => s.lectures) : []),
    [course]
  );
  const activeLecture = allLectures.find((l) => l.id === activeLectureId);

  function getYouTubeId(url) {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }

  const youTubeId = activeLecture ? getYouTubeId(activeLecture.video_url) : null;

  const completedCount = allLectures.filter((l) => l.completed).length;
  const progressPercent = allLectures.length ? (completedCount / allLectures.length) * 100 : 0;

  if (loading) return <Spinner label="Loading player…" />;
  if (!course) return null;

  if (!course.is_enrolled) {
    return (
      <div className="max-w-lg mx-auto text-center py-24 px-4">
        <p className="text-5xl mb-4">🔒</p>
        <h1 className="font-display text-xl font-bold mb-2">Not enrolled yet</h1>
        <p className="text-ash mb-6">
          {currentUser?.name} isn't enrolled in this course. Enroll first — it's instant.
        </p>
        <Link
          to={`/courses/${id}`}
          className="bg-ember hover:bg-ember-dark transition-all text-ink font-semibold px-6 py-2.5 rounded-full hover:scale-105 active:scale-95 inline-block"
        >
          Go to course page
        </Link>
      </div>
    );
  }

  async function toggleComplete(lecture) {
    await api.setLectureProgress(lecture.id, currentUser.id, !lecture.completed);
    await load();
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-56px)]">
      <div className="flex-1 bg-black">
        <div className="max-w-5xl mx-auto">
          {activeLecture ? (
            youTubeId ? (
              <iframe
                key={activeLecture.id}
                src={`https://www.youtube.com/embed/${youTubeId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full aspect-video bg-black"
              />
            ) : (
              <video
                key={activeLecture.id}
                src={activeLecture.video_url}
                controls
                className="w-full aspect-video bg-black"
              />
            )
          ) : (
            <div className="aspect-video flex items-center justify-center text-white/40 text-lg">
              Select a lecture to begin
            </div>
          )}
          <div className="bg-white px-6 py-4 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs text-ash truncate">{course.title}</p>
              <h1 className="font-display font-bold text-lg truncate">{activeLecture?.title}</h1>
            </div>
            {activeLecture && (
              <button
                onClick={() => toggleComplete(activeLecture)}
                className={`text-sm font-medium px-5 py-2 rounded-full shrink-0 transition-all hover:scale-105 active:scale-95 ${
                  activeLecture.completed
                    ? "bg-jade-light text-jade-dark"
                    : "bg-ink text-white hover:bg-ink-light"
                }`}
              >
                {activeLecture.completed ? "✓ Completed" : "Mark as complete"}
              </button>
            )}
          </div>
        </div>
      </div>

      <aside className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-ink/10 lg:overflow-y-auto lg:max-h-[calc(100vh-56px)] flex flex-col">
        <div className="p-5 border-b border-ink/10 bg-paper/50">
          <button
            onClick={() => navigate(`/courses/${id}`)}
            className="text-xs text-jade-dark font-medium hover:text-jade transition-colors mb-3 inline-flex items-center gap-1"
          >
            ← Course details
          </button>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm font-medium">
              {completedCount}/{allLectures.length} lectures
            </p>
            <span className="text-xs text-ash font-mono">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 bg-ink/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-jade to-jade-light rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {course.sections.map((section) => (
            <div key={section.id}>
              <p className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-ash bg-ink/5 sticky top-0">
                {section.title}
              </p>
              <ul>
                {section.lectures.map((lec) => (
                  <li key={lec.id}>
                    <button
                      onClick={() => setActiveLectureId(lec.id)}
                      className={`w-full text-left flex items-center gap-3 px-5 py-3 text-sm border-b border-ink/5 transition-colors ${
                        activeLectureId === lec.id
                          ? "bg-jade-light border-l-2 border-l-jade"
                          : "hover:bg-paper"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                        lec.completed
                          ? "bg-jade text-white"
                          : activeLectureId === lec.id
                            ? "bg-jade/20 text-jade-dark"
                            : "bg-ink/10 text-ash"
                      }`}>
                        {lec.completed ? "✓" : "○"}
                      </span>
                      <span className={`flex-1 truncate ${
                        activeLectureId === lec.id ? "font-medium text-jade-dark" : ""
                      }`}>
                        {lec.title}
                      </span>
                      <span className="text-xs text-ash font-mono shrink-0">{lec.duration_minutes}m</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {completedCount === allLectures.length && allLectures.length > 0 && (
          <div className="p-4 border-t border-ink/10 bg-paper/50">
            <Link
              to={`/quiz/${id}`}
              className="block w-full bg-jade hover:bg-jade-dark text-white text-sm font-semibold text-center py-2.5 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              📝 Take Assessment
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
