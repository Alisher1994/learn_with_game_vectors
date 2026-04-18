import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { HOST_LOTTIE } from "../data/hostLottiePaths";

/** Ожидание ответа соперника — астронавт */
export function HostWaitAstronaut() {
  return (
    <div
      className="host-wait-astronaut"
      aria-hidden
      style={{ marginTop: "0.5rem", width: "100%", maxWidth: 260, marginInline: "auto" }}
    >
      <DotLottieReact
        src={HOST_LOTTIE.astronaut}
        loop
        autoplay
        style={{ width: "100%", height: "min(28vh, 220px)" }}
      />
    </div>
  );
}
