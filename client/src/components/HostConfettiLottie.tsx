import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { HOST_LOTTIE } from "../data/hostLottiePaths";

type Side = "blue" | "red" | "both" | "none";

/** Салют Lottie с той стороны, где ответ верный */
export function HostConfettiLottie({ side }: { side: Side }) {
  if (side === "none") return null;

  if (side === "both") {
    return (
      <div className="host-lottie-confetti host-lottie-confetti--both" aria-hidden>
        <DotLottieReact
          src={HOST_LOTTIE.confetti}
          loop
          autoplay
          style={{ width: "100%", height: "min(42vh, 320px)", maxWidth: 900 }}
        />
      </div>
    );
  }

  return (
    <div
      className={`host-lottie-confetti host-lottie-confetti--${side}`}
      aria-hidden
    >
      <DotLottieReact
        src={HOST_LOTTIE.confetti}
        loop
        autoplay
        style={{ width: "100%", height: "min(40vh, 300px)", maxWidth: 480 }}
      />
    </div>
  );
}
