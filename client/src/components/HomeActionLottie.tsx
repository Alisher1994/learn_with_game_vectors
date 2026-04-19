import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useEffect, useState } from "react";

type ActionKind = "play" | "rating";

const ACTION_LOTTIE: Record<ActionKind, string> = {
  play: "/play-button.lottie",
  rating: "/star-rating.lottie",
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
        className="home-action-lottie home-action-lottie--fallback"
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
    <div
      aria-hidden
      className="home-action-lottie"
      style={{
        width: size,
        height: size,
      }}
    >
      <DotLottieReact
        src={src}
        loop
        autoplay
        style={{
          width: size,
          height: size,
          flexShrink: 0,
        }}
      />
    </div>
  );
}
