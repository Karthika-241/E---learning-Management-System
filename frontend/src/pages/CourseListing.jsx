import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import CourseCard from "../components/CourseCard";
import CategoryStrip from "../components/CategoryStrip";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const SORTS = [
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest rated" },
  { value: "price_low", label: "Price: low to high" },
  { value: "price_high", label: "Price: high to low" },
];

export default function CourseListing() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const categorySlug = params.get("category_slug") || "";
  const level = params.get("level") || "";
  const sort = params.get("sort") || "popular";

  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .listCourses({
        q: q || undefined,
        category_slug: categorySlug || undefined,
        level: level || undefined,
        sort,
      })
      .then(setCourses)
      .finally(() => setLoading(false));
  }, [q, categorySlug, level, sort]);

  function updateParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold">
          {q ? (
            <>
              Results for <span className="text-jade-dark">“{q}”</span>
            </>
          ) : (
            "Explore courses"
          )}
        </h1>
        <p className="text-ash text-sm mt-1">{courses.length} courses found</p>
      </div>

      <div className="mb-5">
        <CategoryStrip categories={categories} />
      </div>

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <select
          value={level}
          onChange={(e) => updateParam("level", e.target.value)}
          className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-sm"
        >
          <option value="">All levels</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-sm ml-auto"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              Sort: {s.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner label="Finding courses…" />
      ) : courses.length === 0 ? (
        <EmptyState
          icon="🔎"
          title="No courses match those filters yet. Try a broader search or clear a filter."
          action={
            <button
              onClick={() => setParams({})}
              className="text-jade-dark font-medium text-sm hover:underline"
            >
              Clear all filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
