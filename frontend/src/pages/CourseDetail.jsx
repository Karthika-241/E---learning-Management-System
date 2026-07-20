import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, thumbnailUrl } from "../api/client";
import StarRating from "../components/StarRating";
import Spinner from "../components/Spinner";
import { useCurrentUser } from "../context/CurrentUserContext";

function totalMinutes(sections) {
  return sections.reduce(
    (sum, s) => sum + s.lectures.reduce((s2, l) => s2 + l.duration_minutes, 0),
    0
  );
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolledMsg, setEnrolledMsg] = useState("");
  const [openSection, setOpenSection] = useState(0);
  const [reviewDraft, setReviewDraft] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  function load() {
    setLoading(true);
    return api.getCourse(id, currentUser?.id).then(setCourse).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentUser?.id]);

  if (loading) return <Spinner label="Loading course…" />;
  if (!course) return null;

  const lectureCount = course.sections.reduce((n, s) => n + s.lectures.length, 0);
  const hours = (totalMinutes(course.sections) / 60).toFixed(1);

  async function handleEnroll() {
    if (!currentUser) return;
    setEnrolling(true);
    try {
      await api.enroll(currentUser.id, course.id);
      await load();
      setEnrolledMsg("🎉 Welcome! You have successfully enrolled in this course. Happy learning!");
      setTimeout(() => setEnrolledMsg(""), 5000);
    } catch (e) {
      await load();
    } finally {
      setEnrolling(false);
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.addReview(course.id, currentUser.id, Number(reviewDraft.rating), reviewDraft.comment);
      setReviewDraft({ rating: 5, comment: "" });
      await load();
    } finally {
      setSubmittingReview(false);
    }
  }

  const myReview = course.reviews.find((r) => r.user.id === currentUser?.id);

  return (
    <div>
      <section className="relative bg-ink text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink-light to-ink/95" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-jade/5 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 grid md:grid-cols-[1.4fr_1fr] gap-8 items-start">
          <div className="animate-fade-in">
            <span className="text-xs font-mono uppercase tracking-[0.12em] text-ember">
              {course.category?.icon} {course.category?.name} · {course.level}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold mt-3 leading-tight tracking-tight">
              {course.title}
            </h1>
            <p className="text-white/60 mt-3 text-lg leading-relaxed">{course.subtitle}</p>

            <div className="flex flex-wrap items-center gap-4 mt-5">
              <StarRating rating={course.avg_rating} />
              <span className="text-white/50 text-sm">
                ({course.review_count} reviews) · {course.student_count} students
              </span>
            </div>
            <div className="flex items-center gap-3 mt-4 text-sm">
              <span className="text-2xl">{course.instructor?.avatar_emoji}</span>
              <div>
                <p className="text-white font-medium">{course.instructor?.name}</p>
                <p className="text-white/50 text-xs">{course.instructor?.headline}</p>
              </div>
            </div>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <div className="bg-white text-ink rounded-2xl shadow-xl overflow-hidden">
              {enrolledMsg && (
                <div className="bg-jade-light text-jade-dark text-sm font-medium px-5 py-3 text-center border-b border-jade/20">
                  {enrolledMsg}
                </div>
              )}
              <img
                src={thumbnailUrl(course.thumbnail_seed, 480, 260)}
                alt=""
                className="w-full aspect-video object-cover"
              />
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-3xl font-extrabold">
                    {course.price === 0 ? "Free" : `₹${course.price.toFixed(0)}`}
                  </span>
                  <span className="text-sm text-ash">
                    {lectureCount} lectures · {hours}h total
                  </span>
                </div>

                {course.is_enrolled ? (
                  <button
                    onClick={() => navigate(`/learn/${course.id}`)}
                    className="w-full bg-jade hover:bg-jade-dark transition-all text-white font-semibold py-3 rounded-full hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-jade/20"
                  >
                    ▶ Go to course player
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling || !currentUser}
                    className="w-full bg-ember hover:bg-ember-dark transition-all disabled:opacity-60 text-ink font-semibold py-3 rounded-full hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-ember/20"
                  >
                    {enrolling ? "Enrolling…" : "Enroll now — it's instant"}
                  </button>
                )}
                <p className="text-xs text-ash text-center">
                  No payment step in this demo — enrolling adds it straight to My Learning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid md:grid-cols-[1.4fr_1fr] gap-10">
        <div className="flex flex-col gap-10">
          <div className="animate-fade-in">
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-jade rounded-full" />
              Description
            </h2>
            <p className="text-ink/80 leading-relaxed whitespace-pre-line">{course.description}</p>
          </div>

          <div className="animate-fade-in">
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-jade rounded-full" />
              Curriculum
            </h2>
            <div className="border border-ink/10 rounded-xl overflow-hidden divide-y divide-ink/10 bg-white shadow-sm">
              {course.sections.map((section, idx) => (
                <div key={section.id}>
                  <button
                    onClick={() => setOpenSection(openSection === idx ? -1 : idx)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-paper transition-colors"
                  >
                    <span className="font-medium">
                      {section.title}{" "}
                      <span className="text-ash font-normal text-sm">
                        ({section.lectures.length} lectures)
                      </span>
                    </span>
                    <span className={`text-ash transition-transform ${openSection === idx ? "rotate-45" : ""}`}>
                      {openSection === idx ? "✕" : "+"}
                    </span>
                  </button>
                  {openSection === idx && (
                    <ul className="animate-fade-in">
                      {section.lectures.map((lec) => (
                        <li
                          key={lec.id}
                          className="px-5 py-3 flex items-center justify-between text-sm border-t border-ink/5 hover:bg-paper/50 transition-colors"
                        >
                          <span className="flex items-center gap-2.5">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              lec.is_preview || course.is_enrolled
                                ? "bg-jade-light text-jade-dark"
                                : "bg-ink/10 text-ash"
                            }`}>
                              {lec.is_preview ? "▶" : "🔒"}
                            </span>
                            {lec.title}
                            {lec.is_preview && !course.is_enrolled && (
                              <span className="text-xs text-jade-dark font-medium bg-jade-light px-2 py-0.5 rounded-full">
                                Preview
                              </span>
                            )}
                          </span>
                          <span className="text-ash font-mono text-xs">{lec.duration_minutes} min</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="animate-fade-in">
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-jade rounded-full" />
              Student reviews ({course.review_count})
            </h2>

            {course.is_enrolled && (
              <form
                onSubmit={handleReviewSubmit}
                className="bg-white border border-ink/10 rounded-xl p-5 mb-6 flex flex-col gap-4 shadow-sm"
              >
                <p className="text-sm font-medium">
                  {myReview ? "✏️ Update your review" : "✏️ Leave a review"}
                </p>
                <select
                  value={reviewDraft.rating}
                  onChange={(e) => setReviewDraft((d) => ({ ...d, rating: e.target.value }))}
                  className="rounded-lg border border-ink/15 px-3 py-2 text-sm bg-white focus:border-jade transition-colors w-36"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
                <textarea
                  value={reviewDraft.comment}
                  onChange={(e) => setReviewDraft((d) => ({ ...d, comment: e.target.value }))}
                  placeholder="What did you think of this course?"
                  className="rounded-lg border border-ink/15 px-3 py-2 text-sm min-h-[90px] focus:border-jade transition-colors"
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="self-start bg-ink hover:bg-ink-light text-white text-sm font-medium px-5 py-2.5 rounded-full disabled:opacity-60 transition-all hover:scale-105 active:scale-95"
                >
                  {submittingReview ? "Saving…" : myReview ? "Update review" : "Submit review"}
                </button>
              </form>
            )}

            <div className="flex flex-col gap-5">
              {course.reviews.length === 0 && (
                <p className="text-ash text-sm">No reviews yet — be the first once you enroll.</p>
              )}
              {course.reviews.map((r) => (
                <div key={r.id} className="border-b border-ink/10 pb-4 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{r.user.avatar_emoji}</span>
                    <span className="font-medium text-sm">{r.user.name}</span>
                    <StarRating rating={r.rating} showNumber={false} />
                  </div>
                  {r.comment && <p className="text-sm text-ink/70 mt-1.5 leading-relaxed">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="hidden md:block">
          <div className="sticky top-24 bg-white border border-ink/10 rounded-xl p-6 shadow-sm">
            <h3 className="font-display font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-jade rounded-full" />
              Instructor
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{course.instructor?.avatar_emoji}</span>
              <div>
                <p className="font-medium">{course.instructor?.name}</p>
                <p className="text-xs text-ash">{course.instructor?.headline}</p>
              </div>
            </div>
            <Link
              to="/courses"
              className="block text-center mt-6 text-jade-dark text-sm font-medium hover:text-jade transition-colors border-t border-ink/10 pt-5"
            >
              ← Back to all courses
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
