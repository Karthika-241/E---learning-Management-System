import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import ProgressRing from "./ProgressRing";
import { thumbnailUrl } from "../api/client";

export default function CourseCard({ course, progressPercent }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="group flex flex-col rounded-2xl bg-white shadow-card overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden bg-ink-soft">
        <img
          src={thumbnailUrl(course.thumbnail_seed)}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {course.price === 0 && (
          <span className="absolute top-3 left-3 bg-jade text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md">
            Free
          </span>
        )}
        {typeof progressPercent === "number" && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-0.5 shadow">
            <ProgressRing percent={progressPercent} size={38} stroke={3.5} />
          </div>
        )}
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-white/90 backdrop-blur-sm text-ink text-xs font-medium px-2.5 py-1 rounded-full shadow">
            View course →
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 p-4 flex-1">
        <span className="text-xs font-mono uppercase tracking-wide text-jade-dark">
          {course.category?.icon} {course.category?.name}
        </span>
        <h3 className="font-display font-semibold text-ink leading-snug line-clamp-2 group-hover:text-jade-dark transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-ash line-clamp-2">{course.subtitle}</p>

        <div className="mt-auto pt-2 flex items-center justify-between">
          <StarRating rating={course.avg_rating} />
          <span className="text-xs text-ash">{course.student_count} students</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs bg-paper border border-ink/10 rounded-full px-2.5 py-0.5 text-ash">
            {course.level}
          </span>
          <span className="font-display font-bold text-ink text-lg">
            {course.price === 0 ? "Free" : `₹${course.price.toFixed(0)}`}
          </span>
        </div>
      </div>
    </Link>
  );
}
