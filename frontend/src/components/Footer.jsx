import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-ink/10 bg-paper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="font-display font-bold text-xl text-ink">
              learn<span className="text-ember">ly</span>
            </Link>
            <p className="text-sm text-ash mt-2 leading-relaxed max-w-xs">
              A demo course marketplace — no accounts, no checkout, just a "switch persona" menu standing in for both.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ash mb-3">Browse</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/courses" className="text-ink/70 hover:text-jade-dark transition-colors">Explore courses</Link>
              <Link to="/my-learning" className="text-ink/70 hover:text-jade-dark transition-colors">My Learning</Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ash mb-3">Teach</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/instructor" className="text-ink/70 hover:text-jade-dark transition-colors">Dashboard</Link>
              <Link to="/instructor/new" className="text-ink/70 hover:text-jade-dark transition-colors">Create course</Link>
              <Link to="/become-instructor" className="text-ink/70 hover:text-jade-dark transition-colors">Become instructor</Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ash mb-3">Admin</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/admin" className="text-ink/70 hover:text-jade-dark transition-colors">All courses</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-ink/10 mt-8 pt-6 text-xs text-ash text-center">
          &copy; {new Date().getFullYear()} learnly — built with React + FastAPI
        </div>
      </div>
    </footer>
  );
}
