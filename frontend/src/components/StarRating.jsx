export default function StarRating({ rating = 0, size = "text-sm", showNumber = true }) {
  const rounded = Math.round(rating * 2) / 2;
  const stars = [1, 2, 3, 4, 5].map((n) => {
    if (rounded >= n) return "full";
    if (rounded + 0.5 === n) return "half";
    return "empty";
  });

  return (
    <span className={`inline-flex items-center gap-1.5 ${size}`}>
      {showNumber && (
        <span className="font-mono font-semibold text-amber">{rating.toFixed(1)}</span>
      )}
      <span className="flex" aria-hidden="true">
        {stars.map((kind, i) => (
          <span
            key={i}
            className={`transition-colors ${
              kind === "empty" ? "text-ash/30" : "text-amber"
            }`}
          >
            {kind === "half" ? "★" : "★"}
          </span>
        ))}
      </span>
    </span>
  );
}
