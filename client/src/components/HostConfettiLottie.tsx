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
          className="host-lottie-confetti__burst"
        />
        <DotLottieReact
          src={HOST_LOTTIE.confetti}
          loop
          autoplay
          className="host-lottie-confetti__burst"
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
        className="host-lottie-confetti__burst"
      />
    </div>
  );
}
