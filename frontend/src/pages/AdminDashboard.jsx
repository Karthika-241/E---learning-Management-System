import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, thumbnailUrl } from "../api/client";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import StarRating from "../components/StarRating";

export default function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  function load() {
    setLoading(true);
    api.listCourses({ sort: "newest" }).then(setCourses).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(courseId) {
    if (!window.confirm("Delete this course permanently?")) return;
    setDeleting(courseId);
    try {
      await api.deleteCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch {
      alert("Failed to delete course");
    } finally {
      setDeleting(null);
    }
  }

  if (loading) return <Spinner label="Loading all courses…" />;

  const totalStudents = courses.reduce((n, c) => n + c.student_count, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Admin — All Courses</h1>
          <p className="text-ash text-sm mt-1">
            {courses.length} courses · {totalStudents} students total
          </p>
        </div>
        <Link
          to="/instructor/new"
          className="bg-ember hover:bg-ember-dark transition-colors text-ink font-semibold px-4 py-2.5 rounded-full"
        >
          + New course
        </Link>
      </div>

      {courses.length === 0 ? (
        <EmptyState icon="📚" title="No courses have been published yet." />
      ) : (
        <div className="flex flex-col divide-y divide-ink/10 border border-ink/10 rounded-2xl bg-white shadow-sm overflow-hidden">
          {courses.map((c, i) => (
            <div key={c.id} className="flex items-center gap-4 p-4 hover:bg-paper transition-colors animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <Link to={`/courses/${c.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                <img
                  src={thumbnailUrl(c.thumbnail_seed, 120, 80)}
                  alt=""
                  className="w-24 h-16 object-cover rounded-lg shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{c.title}</p>
                  <div className="flex items-center gap-2 text-xs text-ash mt-0.5">
                    <span>{c.instructor?.avatar_emoji} {c.instructor?.name}</span>
                    <span className="text-ash/40">·</span>
                    <span className="font-mono text-jade-dark">{c.category?.name}</span>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0">
                  <StarRating rating={c.avg_rating} size="text-xs" />
                  <span className="text-xs text-ash">{c.student_count} students</span>
                </div>
                <span className="font-display font-bold shrink-0 text-lg">
                  {c.price === 0 ? "Free" : `₹${c.price.toFixed(0)}`}
                </span>
              </Link>
              <Link
                to={`/instructor/edit/${c.id}`}
                className="text-xs text-jade-dark font-medium hover:bg-jade-light px-3 py-1.5 rounded-full transition-colors shrink-0"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(c.id)}
                disabled={deleting === c.id}
                className="text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors font-medium shrink-0 disabled:opacity-50"
              >
                {deleting === c.id ? "…" : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
