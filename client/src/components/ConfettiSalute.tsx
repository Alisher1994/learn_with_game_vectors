import { useMemo } from "react";

type Side = "blue" | "red" | "both" | "none";

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  hue: number;
  size: number;
  drift: number;
  side: "left" | "right";
}

/** Салют слева/справа при верном ответе (как «удар» в файтинге) */
export function ConfettiSalute({ side }: { side: Side }) {
  const particles = useMemo(() => {
    if (side === "none") return [];
    const count = side === "both" ? 70 : 48;
    const out: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const fromLeft = side === "blue" || (side === "both" && i % 2 === 0);
      out.push({
        id: i,
        x: fromLeft ? 4 + Math.random() * 22 : 74 + Math.random() * 22,
        y: 55 + Math.random() * 35,
        delay: Math.random() * 0.35,
        duration: 1.6 + Math.random() * 0.9,
        hue: fromLeft ? 200 + Math.random() * 40 : 0 + Math.random() * 35,
        size: 6 + Math.random() * 10,
        drift: (Math.random() - 0.5) * 120,
        side: fromLeft ? "left" : "right",
      });
    }
    return out;
  }, [side]);

  if (side === "none" || particles.length === 0) return null;

  return (
    <div className="confetti-salute" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="confetti-salute__piece"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size * 0.6,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ["--drift" as string]: `${p.drift}px`,
            background: `hsl(${p.hue} 85% 55%)`,
            boxShadow: `0 0 12px hsl(${p.hue} 90% 50% / 0.7)`,
          }}
        />
      ))}
    </div>
  );
}
