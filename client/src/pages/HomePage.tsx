import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    <div className="page">
      <div className="card">
        <div className="hero-panel">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <AiRobotMascot mood="happy" size={148} />
          </div>
          <div>
            <div className="hero-kicker">{copy.homeKicker}</div>
            <h1 className="hero-title">{copy.homeTitle}</h1>
            <p className="hero-text">{copy.homeText}</p>
          </div>
        </div>

        <div className="home-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={loading}
            onClick={() => void createRoom()}
          >
            {loading ? copy.creatingRoom : copy.createRoom}
          </button>
          <Link to="/teacher" className="btn btn-ghost" style={{ textDecoration: "none" }}>
            {copy.teacherDirectory}
          </Link>
          <Link to="/ratings" className="btn btn-ghost" style={{ textDecoration: "none" }}>
            {copy.rankingsTitleLink}
          </Link>
        </div>

        <p style={{ marginTop: "1.2rem", fontSize: "0.95rem", color: "var(--muted)" }}>
          {copy.homeFooter}
        </p>
      </div>
    </div>
  );
}
