import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { AiRobotMascot } from "../components/AiRobotMascot";
import { api } from "../socketUrl";
import { t, useI18n } from "../i18n";

export function HomePage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const { lang } = useI18n();
  const copy = t[lang];

  async function createRoom() {
    setLoading(true);
    try {
      const { roomId } = await api<{ roomId: string }>("/api/rooms", {
        method: "POST",
      });
      nav(`/host/${roomId}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page page--home">
      <Link to="/teacher" className="home-settings" aria-label={copy.teacherSettings}>
        ⚙
      </Link>

      <div className="home-hero">
        <div className="home-hero__mascot">
          <AiRobotMascot mood="happy" size={236} />
        </div>
        <div className="home-hero__content">
          <div className="hero-kicker">{copy.homeKicker}</div>
          <h1 className="hero-title">{copy.homeTitle}</h1>
          <p className="hero-text">{copy.homeText}</p>
        </div>
      </div>

      <div className="home-actions home-actions--center">
        <button
          type="button"
          className="home-tile home-tile--primary"
          disabled={loading}
          onClick={() => void createRoom()}
        >
          <div className="home-tile__media">
            <DotLottieReact
              src="/Play button.lottie"
              loop
              autoplay
              className="home-tile__lottie"
            />
          </div>
          <span className="home-tile__title">{loading ? copy.creatingRoom : copy.startShort}</span>
        </button>
        <Link to="/ratings" className="home-tile home-tile--ghost">
          <div className="home-tile__media">
            <DotLottieReact
              src="/Star rating.lottie"
              loop
              autoplay
              className="home-tile__lottie"
            />
          </div>
          <span className="home-tile__title">{copy.rankingShort}</span>
        </Link>
      </div>
    </div>
  );
}
