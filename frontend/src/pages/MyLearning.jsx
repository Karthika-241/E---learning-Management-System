import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import CourseCard from "../components/CourseCard";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import { useCurrentUser } from "../context/CurrentUserContext";

export default function MyLearning() {
  const { currentUser } = useCurrentUser();
  const [enrollments, setEnrollments] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    api.myLearning(currentUser.id).then(async (enrolls) => {
      setEnrollments(enrolls);
      const scoreMap = {};
      for (const e of enrolls) {
        try {
          const attempts = await api.getQuizAttempts(e.course.id, currentUser.id);
          if (attempts.length > 0) {
            scoreMap[e.course.id] = attempts[0];
          }
        } catch {
          // no quiz data
        }
      }
      setScores(scoreMap);
    }).finally(() => setLoading(false));
  }, [currentUser?.id]);

  if (loading) return <Spinner label="Loading your courses…" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl font-bold mb-1">My Learning</h1>
      <p className="text-ash text-sm mb-6">
        Courses {currentUser?.name} is enrolled in — enrolled instantly, no receipt needed.
      </p>

      {enrollments.length === 0 ? (
        <EmptyState
          icon="🎒"
          title="No courses yet. Enroll in something from the catalog to see it here."
          action={
            <Link
              to="/courses"
              className="bg-ink text-white text-sm font-medium px-4 py-2 rounded-full"
            >
              Browse courses
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {enrollments.map((e) => (
            <div key={e.id} className="relative">
              <CourseCard course={e.course} progressPercent={e.progress_percent} />
              {scores[e.course.id] && (
                <div className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full ${
                  scores[e.course.id].passed ? "bg-jade text-white" : "bg-amber text-white"
                }`}>
                  {scores[e.course.id].score}/{scores[e.course.id].total}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
