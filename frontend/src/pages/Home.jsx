import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import CourseCard from "../components/CourseCard";
import CategoryStrip from "../components/CategoryStrip";
import Spinner from "../components/Spinner";
import { useCurrentUser } from "../context/CurrentUserContext";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    Promise.all([api.listCategories(), api.listCourses({ sort: "popular" })])
      .then(([cats, list]) => {
        setCategories(cats);
        setCourses(list);
      })
      .finally(() => setLoading(false));
  }, []);

  function onSearch(e) {
    e.preventDefault();
    navigate(query.trim() ? `/courses?q=${encodeURIComponent(query.trim())}` : "/courses");
  }

  return (
    <div>
      <section className="relative bg-ink text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink-light to-ink-soft opacity-90" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-jade/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-ember/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12 flex flex-col gap-6">
          <div className="max-w-2xl animate-fade-in">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-ember mb-3">
              ✦ No sign-up · No checkout · Just courses
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Learn what you need,{" "}
              <br />— skip the paperwork.
            </h1>
            <p className="mt-5 text-white/60 text-lg max-w-lg leading-relaxed">
              Browse real courses, watch lectures, and track progress. Enrollment is instant
              and free — there's no cart, no card, no login form.
            </p>
          </div>

          <form onSubmit={onSearch} className="max-w-xl animate-fade-in-delay-1">
            <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/10 rounded-full overflow-hidden shadow-xl hover:bg-white/[0.14] transition-colors">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Try “python”, “design”, “public speaking”..."
                className="flex-1 px-5 py-3 bg-transparent text-white placeholder-white/40 outline-none"
              />
              <button
                type="submit"
                className="bg-ember hover:bg-ember-dark transition-all text-ink font-semibold px-7 py-3 hover:scale-105 active:scale-95"
              >
                Search →
              </button>
            </div>
          </form>

          {categories.length > 0 && (
            <div className="pt-2 animate-fade-in-delay-2">
              <CategoryStrip categories={categories} />
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Trending this week</h2>
            <p className="text-ash text-sm mt-1">Most popular courses right now</p>
          </div>
          <a href="/courses" className="group text-jade-dark font-medium text-sm hover:text-jade inline-flex items-center gap-1">
            View all
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </a>
        </div>

        {loading ? (
          <Spinner label="Loading courses…" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.slice(0, 8).map((c, i) => (
              <div key={c.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <CourseCard course={c} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="relative rounded-2xl bg-gradient-to-br from-jade-dark via-jade to-jade-light px-8 py-12 sm:px-14 sm:py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative">
            <p className="text-white/60 text-xs font-mono uppercase tracking-widest mb-2">FOR INSTRUCTORS</p>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Know something worth teaching?
            </h3>
            <p className="text-white/80 mt-2 max-w-md leading-relaxed">
              Switch to an instructor persona and publish a course in minutes — no review
              queue, no approval wait.
            </p>
          </div>
          <a
            href="/become-instructor"
            className="relative shrink-0 bg-white text-jade-dark hover:bg-white/90 transition-all font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            Start teaching →
          </a>
        </div>
      </section>
    </div>
  );
}
