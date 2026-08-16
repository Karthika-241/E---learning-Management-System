import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../context/CurrentUserContext";

const EMOJIS = ["🧑‍🎓", "👩‍🎓", "🧑‍💻", "🎨"];

export default function StudentAuth() {
  const { login, signup } = useCurrentUser();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [headline, setHeadline] = useState("Just started learning");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (mode === "login") {
        if (!email.trim() || !password) {
          setError("Please enter your email and password.");
          return;
        }
        await login(email.trim(), password);
      } else {
        if (!name.trim() || !email.trim() || !password) {
          setError("Please fill in your name, email, and password.");
          return;
        }
        await signup({
          name: name.trim(),
          role: "student",
          headline: headline.trim() || "Just started learning",
          avatar_emoji: emoji,
          email: email.trim(),
          password,
        });
      }
      navigate("/my-learning");
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to complete that request.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-[70vh] bg-paper py-12 px-4">
      <div className="max-w-5xl mx-auto grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <div className="bg-white border border-ink/10 rounded-2xl p-8 shadow-sm">
          <p className="text-ember text-sm font-semibold uppercase tracking-[0.2em]">Student access</p>
          <h1 className="font-display text-3xl font-bold mt-2">Join your learning journey</h1>
          <p className="text-ash mt-3 leading-relaxed">
            Sign up or log in to keep track of your courses, resume lessons, and build a personal learning history.
          </p>

          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                mode === "login" ? "bg-ink text-white" : "bg-ink/5 text-ink"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                mode === "signup" ? "bg-ink text-white" : "bg-ink/5 text-ink"
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <>
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Full name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Asha Kumar"
                    className="rounded-lg border border-ink/15 px-3 py-2 font-normal"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Learning headline
                  <input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Building web apps"
                    className="rounded-lg border border-ink/15 px-3 py-2 font-normal"
                  />
                </label>
                <div className="flex flex-col gap-1 text-sm font-medium">
                  Avatar
                  <div className="flex gap-2">
                    {EMOJIS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setEmoji(item)}
                        className={`text-xl w-10 h-10 rounded-full flex items-center justify-center border ${
                          emoji === item ? "border-jade bg-jade-light" : "border-ink/10"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <label className="flex flex-col gap-1 text-sm font-medium">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="rounded-lg border border-ink/15 px-3 py-2 font-normal"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="rounded-lg border border-ink/15 px-3 py-2 font-normal"
              />
            </label>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-jade hover:bg-jade-dark text-white font-semibold py-2.5 rounded-full transition-colors disabled:opacity-60"
            >
              {saving ? "Working…" : mode === "login" ? "Login" : "Create account"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl bg-ink text-white p-8 shadow-sm">
          <h2 className="font-display text-2xl font-bold">Why students use it</h2>
          <ul className="mt-5 space-y-3 text-sm text-white/80">
            <li>• Keep your learning progress in one place</li>
            <li>• Resume courses from where you left off</li>
            <li>• Get a personal student identity in the app</li>
            <li>• Switch easily between student and instructor personas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
