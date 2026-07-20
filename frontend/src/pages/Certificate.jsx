import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { api } from "../api/client";
import { useCurrentUser } from "../context/CurrentUserContext";
import Spinner from "../components/Spinner";

export default function Certificate() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { currentUser } = useCurrentUser();
  const certRef = useRef(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  const score = searchParams.get("score") || "—";
  const total = searchParams.get("total") || "—";

  useEffect(() => {
    if (!currentUser) return;
    setName(currentUser.name);
    api.getCourse(id, currentUser.id).then(setCourse).finally(() => setLoading(false));
  }, [id, currentUser]);

  if (loading) return <Spinner label="Loading…" />;
  if (!course) return null;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="no-print flex items-center justify-between mb-6">
        <Link to={`/learn/${id}`} className="text-xs text-jade-dark font-medium hover:text-jade transition-colors inline-flex items-center gap-1">
          ← Back to course
        </Link>
        <button
          onClick={handlePrint}
          className="bg-ink hover:bg-ink-light text-white text-sm font-medium px-6 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
        >
          🖨 Print / Save PDF
        </button>
      </div>

      <div ref={certRef} className="relative bg-white rounded-2xl p-8 sm:p-14 text-center shadow-card overflow-hidden animate-fade-in">
        {/* decorative border */}
        <div className="absolute inset-3 rounded-xl border-2 border-jade/10 pointer-events-none" />
        <div className="absolute inset-4 rounded-lg border border-jade/5 pointer-events-none" />

        {/* corner decorations */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-jade/20 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-jade/20 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-jade/20 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-jade/20 rounded-br-2xl" />

        <div className="relative max-w-lg mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-jade to-jade-light rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-jade/20">
            <span className="text-4xl">🎓</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink mb-2 tracking-tight">
            Certificate of <span className="text-jade-dark">Completion</span>
          </h1>

          <div className="w-16 h-1 bg-gradient-to-r from-jade/40 via-jade to-jade/40 mx-auto my-6 rounded-full" />

          <p className="text-ash text-sm mb-2">This certifies that</p>

          <div className="my-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-center text-3xl sm:text-4xl font-display font-bold text-jade-dark border-0 border-b-2 border-jade/30 outline-none px-4 py-2 w-full focus:border-jade bg-transparent transition-colors"
              placeholder="Enter your name"
            />
          </div>

          <p className="text-ash text-sm mt-4 mb-1">has successfully completed the course</p>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ink mb-8">{course.title}</h2>

          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-jade-light to-jade/10 rounded-full px-6 py-2.5 text-sm font-semibold text-jade-dark mb-8 shadow-sm">
            <span>Score:</span>
            <span className="font-mono text-lg">{score}/{total}</span>
          </div>

          <div className="border-t border-ink/10 pt-6 mt-6">
            <p className="text-xs text-ash">
              Issued on {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-ash">
              <span className="font-display font-bold text-ink">learn<span className="text-ember">ly</span></span>
              <span>— Mini Project</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #fff; }
          .no-print { display: none !important; }
          @page { margin: 0.5in; }
        }
      `}</style>
    </div>
  );
}
