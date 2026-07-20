import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api, thumbnailUrl } from "../api/client";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import StarRating from "../components/StarRating";
import { useCurrentUser } from "../context/CurrentUserContext";

export default function InstructorDashboard() {
  const { currentUser } = useCurrentUser();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "instructor") return;
    setLoading(true);
    api.coursesByInstructor(currentUser.id).then(setCourses).finally(() => setLoading(false));
  }, [currentUser?.id]);

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

  if (currentUser && currentUser.role !== "instructor") {
    return <Navigate to="/become-instructor" replace />;
  }

  if (loading) return <Spinner label="Loading your courses…" />;

  const totalStudents = courses.reduce((n, c) => n + c.student_count, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Instructor dashboard</h1>
          <p className="text-ash text-sm mt-1">
            {currentUser?.name} · {courses.length} courses · {totalStudents} students total
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/courses"
            className="bg-white border border-ink/20 hover:border-ink/40 transition-colors text-ink font-semibold px-4 py-2.5 rounded-full text-sm"
          >
            Browse all courses
          </Link>
          <Link
            to="/instructor/new"
            className="bg-ember hover:bg-ember-dark transition-colors text-ink font-semibold px-4 py-2.5 rounded-full"
          >
            + New course
          </Link>
        </div>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon="🎓"
          title="You haven't published a course yet. It only takes a few minutes."
          action={
            <Link
              to="/instructor/new"
              className="bg-ink text-white text-sm font-medium px-4 py-2 rounded-full"
            >
              Create your first course
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col divide-y divide-ink/10 border border-ink/10 rounded-xl2 bg-white overflow-hidden">
          {courses.map((c) => (
            <div key={c.id} className="flex items-center gap-4 p-4 hover:bg-paper transition-colors">
              <Link to={`/courses/${c.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                <img
                  src={thumbnailUrl(c.thumbnail_seed, 120, 80)}
                  alt=""
                  className="w-24 h-16 object-cover rounded-lg shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{c.title}</p>
                  <p className="text-xs text-ash truncate">{c.subtitle}</p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                  <StarRating rating={c.avg_rating} size="text-xs" />
                  <span className="text-xs text-ash">{c.student_count} students</span>
                </div>
                <span className="font-display font-bold shrink-0">
                  {c.price === 0 ? "Free" : `₹${c.price.toFixed(0)}`}
                </span>
              </Link>
              <Link
                to={`/instructor/edit/${c.id}`}
                className="text-xs text-jade-dark font-medium hover:underline shrink-0"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(c.id)}
                disabled={deleting === c.id}
                className="text-xs text-red-500 hover:text-red-700 font-medium shrink-0 disabled:opacity-50"
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
