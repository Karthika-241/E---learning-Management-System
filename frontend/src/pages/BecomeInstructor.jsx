import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../context/CurrentUserContext";

const EMOJIS = ["🧑‍🏫", "👩‍💻", "🧑‍🔬", "👩‍🎨", "🧑‍🚀", "👨‍🏫"];

export default function BecomeInstructor() {
  const { addUser } = useCurrentUser();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await addUser({ name: name.trim(), role: "instructor", headline, avatar_emoji: emoji });
      navigate("/instructor");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <h1 className="font-display text-2xl font-bold mb-1">Become an instructor</h1>
      <p className="text-ash text-sm mb-6">
        No signup form, no verification — this just adds a new persona you can switch to and
        publish courses under.
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-ink/10 rounded-xl2 p-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Sharma"
            className="rounded-lg border border-ink/15 px-3 py-2 font-normal"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Headline
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Backend Engineer & Educator"
            className="rounded-lg border border-ink/15 px-3 py-2 font-normal"
          />
        </label>

        <div className="flex flex-col gap-1 text-sm font-medium">
          Avatar
          <div className="flex gap-2">
            {EMOJIS.map((e) => (
              <button
                type="button"
                key={e}
                onClick={() => setEmoji(e)}
                className={`text-xl w-10 h-10 rounded-full flex items-center justify-center border ${
                  emoji === e ? "border-jade bg-jade-light" : "border-ink/10"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-jade hover:bg-jade-dark transition-colors disabled:opacity-60 text-white font-semibold py-2.5 rounded-full"
        >
          {saving ? "Setting up…" : "Start teaching"}
        </button>
      </form>
    </div>
  );
}
