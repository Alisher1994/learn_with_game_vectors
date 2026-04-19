import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useEffect, useState } from "react";

type ActionKind = "play" | "rating";

const ACTION_LOTTIE: Record<ActionKind, string> = {
  play: "/Play button.lottie",
  rating: "/Star rating.lottie",
};

const FALLBACK: Record<ActionKind, string> = {
  play: "▶",
  rating: "★",
};

export function HomeActionLottie({
  kind,
  size = 112,
}: {
  kind: ActionKind;
  size?: number;
}) {
  const [lottieOk, setLottieOk] = useState(false);
  const src = ACTION_LOTTIE[kind];

  useEffect(() => {
    let cancelled = false;
    void fetch(src, { method: "HEAD" })
      .then((res) => {
        if (!cancelled && res.ok) setLottieOk(true);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!lottieOk) {
    return (
      <div
        aria-hidden
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.round(size * 0.56),
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        {FALLBACK[kind]}
      </div>
    );
  }

  return (
    <DotLottieReact
      src={src}
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
