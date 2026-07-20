import { Link, useSearchParams } from "react-router-dom";

export default function CategoryStrip({ categories }) {
  const [params] = useSearchParams();
  const active = params.get("category_slug");

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
      <Link
        to="/courses"
        className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border transition-all ${
          !active
            ? "bg-white text-ink border-white shadow-sm"
            : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20 hover:text-white"
        }`}
      >
        All
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          to={`/courses?category_slug=${c.slug}`}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border transition-all ${
            active === c.slug
              ? "bg-white text-ink border-white shadow-sm"
              : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20 hover:text-white"
          }`}
        >
          {c.icon} {c.name}
        </Link>
      ))}
    </div>
  );
}
