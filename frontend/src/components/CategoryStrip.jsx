import { Link, useSearchParams } from "react-router-dom";

export default function CategoryStrip({ categories, variant = "default" }) {
  const [params] = useSearchParams();
  const active = params.get("category_slug");

  const isDark = variant === "dark";

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
      <Link
        to="/courses"
        className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border transition-all ${
          !active
            ? isDark
              ? "bg-white text-ink border-white shadow-sm"
              : "bg-ink text-white border-ink shadow-sm"
            : isDark
              ? "bg-white/10 text-white/70 border-white/20 hover:bg-white/20 hover:text-white"
              : "bg-white text-ink/60 border-ink/15 hover:bg-paper hover:text-ink"
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
              ? isDark
                ? "bg-white text-ink border-white shadow-sm"
                : "bg-ink text-white border-ink shadow-sm"
              : isDark
                ? "bg-white/10 text-white/70 border-white/20 hover:bg-white/20 hover:text-white"
                : "bg-white text-ink/60 border-ink/15 hover:bg-paper hover:text-ink"
          }`}
        >
          {c.icon} {c.name}
        </Link>
      ))}
    </div>
  );
}
