import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useEffect, useState } from "react";
import { VectorMascot } from "./VectorMascot";

/** Файл в `client/public/` (то же имя, что скачан с LottieFiles) */
export const AI_ROBOT_LOTTIE_PATH = "/Ai Robot Vector Art.lottie";

/**
 * Робот из Lottie (dotLottie). Если файла нет в `public/` — показывается «Векторик».
 */
export function AiRobotMascot({
  size = 120,
  mood = "happy",
}: {
  size?: number;
  mood?: "happy" | "think" | "win";
}) {
  const [lottieOk, setLottieOk] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch(AI_ROBOT_LOTTIE_PATH, { method: "HEAD" }).then((res) => {
      if (!cancelled && res.ok) setLottieOk(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!lottieOk) {
    return <VectorMascot mood={mood} size={size} />;
  }

  return (
    <DotLottieReact
      src={AI_ROBOT_LOTTIE_PATH}
      loop
      autoplay
      aria-hidden
      style={{
        width: size,
        height: size,
        flexShrink: 0,
      }}
    />
  );
}
