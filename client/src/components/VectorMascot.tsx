/** Персонаж «Векторик» — дружелюбная стрелка */
export function VectorMascot({
  mood = "happy",
  size = 120,
}: {
  mood?: "happy" | "think" | "win";
  size?: number;
}) {
  const eyeY = mood === "think" ? 38 : 36;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="vecBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="88" rx="28" ry="6" fill="rgba(0,0,0,0.25)" />
      <path
        d="M20 55 L55 30 L55 42 L80 42 L45 67 L45 55 Z"
        fill="url(#vecBody)"
        stroke="#1e3a8a"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="42" cy={eyeY} r="4" fill="#0f172a" />
      <circle cx="58" cy={eyeY} r="4" fill="#0f172a" />
      {mood === "happy" && (
        <path
          d="M44 48 Q50 52 56 48"
          fill="none"
          stroke="#0f172a"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
      {mood === "think" && (
        <path
          d="M44 50 L56 50"
          stroke="#0f172a"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
      {mood === "win" && (
        <>
          <path
            d="M38 22 L42 26 L50 16"
            fill="none"
            stroke="#eab308"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="72" cy="18" r="3" fill="#fbbf24" opacity="0.9" />
        </>
      )}
    </svg>
  );
}
