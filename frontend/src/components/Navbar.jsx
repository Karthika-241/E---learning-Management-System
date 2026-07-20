import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCurrentUser } from "../context/CurrentUserContext";

const NAV_LINKS = [
  { path: "/courses", label: "Explore" },
  { path: "/my-learning", label: "My Learning" },
  { path: "/admin", label: "Admin" },
];

export default function Navbar() {
  const { users, currentUser, switchUser } = useCurrentUser();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function onSearch(e) {
    e.preventDefault();
    navigate(query.trim() ? `/courses?q=${encodeURIComponent(query.trim())}` : "/courses");
  }

  function isActive(path) {
    if (path === "/courses") return location.pathname.startsWith("/courses") && !location.pathname.includes("/instructor");
    return location.pathname === path;
  }

  return (
    <header className="sticky top-0 z-30 bg-ink text-white">
      <div className="max-w-7xl mx-auto flex items-center gap-4 px-4 sm:px-6 py-3">
        <Link to="/" className="font-display font-extrabold text-xl tracking-tight shrink-0 hover:opacity-80 transition-opacity">
          learn<span className="text-ember">ly</span>
        </Link>

        <form onSubmit={onSearch} className="flex-1 max-w-xl hidden sm:block">
          <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/10 rounded-full overflow-hidden focus-within:border-white/30 focus-within:bg-white/[0.14] transition-all">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search for courses..."
              className="flex-1 px-4 py-2 text-sm bg-transparent text-white placeholder-white/40 outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 text-white/50 hover:text-white transition-colors"
              aria-label="Search"
            >
              🔍
            </button>
          </div>
        </form>

        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-lg transition-all ${
                isActive(link.path)
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {currentUser?.role === "instructor" && (
            <Link
              to="/instructor"
              className={`px-3 py-2 rounded-lg transition-all ${
                isActive("/instructor")
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Teach
            </Link>
          )}
        </nav>

        <button
          onClick={() => setMobileNavOpen((v) => !v)}
          className="md:hidden ml-auto text-white/60 hover:text-white text-xl"
          aria-label="Toggle navigation"
        >
          {mobileNavOpen ? "✕" : "☰"}
        </button>

        <div className="relative ml-auto sm:ml-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full pl-2 pr-3 py-1.5 text-sm transition-all hover:scale-105 active:scale-95"
          >
            <span className="text-lg leading-none">{currentUser?.avatar_emoji ?? "🙂"}</span>
            <span className="hidden sm:inline max-w-[9rem] truncate text-white/90">
              {currentUser?.name ?? "Choose a persona"}
            </span>
            <span className={`text-xs text-white/40 transition-transform ${menuOpen ? "rotate-180" : ""}`}>▾</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white text-ink rounded-xl shadow-xl border border-ink/10 overflow-hidden animate-fade-in">
              <div className="px-4 py-2.5 text-xs text-ash border-b border-ink/10 bg-paper">
                Pick who you're browsing as
              </div>
              <ul className="max-h-64 overflow-y-auto">
                {users.map((u) => (
                  <li key={u.id}>
                    <button
                      onClick={() => {
                        switchUser(u.id);
                        setMenuOpen(false);
                      }}
                      className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        currentUser?.id === u.id
                          ? "bg-jade-light text-jade-dark"
                          : "hover:bg-paper"
                      }`}
                    >
                      <span className="text-xl">{u.avatar_emoji}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-medium leading-tight truncate">{u.name}</span>
                        <span className="block text-xs text-ash leading-tight capitalize">{u.role}</span>
                      </span>
                      {currentUser?.id === u.id && (
                        <span className="text-jade text-xs font-medium">Active</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              <Link
                to="/become-instructor"
                onClick={() => setMenuOpen(false)}
                className="block text-center text-sm font-medium text-jade-dark py-2.5 border-t border-ink/10 hover:bg-jade-light transition-colors"
              >
                + Become an instructor
              </Link>
            </div>
          )}
        </div>
      </div>

      {mobileNavOpen && (
        <div className="md:hidden border-t border-white/10 bg-ink-light animate-fade-in">
          <div className="px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileNavOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive(link.path)
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {currentUser?.role === "instructor" && (
              <Link
                to="/instructor"
                onClick={() => setMobileNavOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive("/instructor")
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                Teach
              </Link>
            )}
          </div>
          <form onSubmit={onSearch} className="px-4 pb-3">
            <div className="flex items-center bg-white/10 border border-white/10 rounded-full overflow-hidden">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search courses..."
                className="flex-1 px-4 py-2 text-sm bg-transparent text-white placeholder-white/40 outline-none"
              />
              <button type="submit" className="px-4 py-2 text-white/50" aria-label="Search">
                🔍
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
