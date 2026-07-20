export default function EmptyState({ icon = "📭", title, action }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-20 px-4 animate-fade-in">
      <span className="text-5xl mb-2">{icon}</span>
      <p className="text-ash max-w-sm leading-relaxed">{title}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
