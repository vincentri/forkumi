export function Meteors() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="absolute block h-0.5 w-28 rotate-[18deg] animate-[meteor_7s_linear_infinite] bg-gradient-to-r from-white to-transparent opacity-50"
          style={{
            top: `${8 + i * 9}%`,
            left: `${-12 + i * 11}%`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}
