export default function Spinner({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-ash">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-jade/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-jade animate-spin" />
        <div className="absolute inset-1 rounded-full border-2 border-transparent border-b-ember animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
      </div>
      <span className="text-sm font-medium animate-pulse">{label}</span>
    </div>
  );
}
