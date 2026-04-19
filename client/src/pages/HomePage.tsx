import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiRobotMascot } from "../components/AiRobotMascot";
import { api } from "../socketUrl";

export function HomePage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

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
            <div className="hero-kicker">Игровая викторина для класса</div>
            <h1 className="hero-title">Вектор-баттл</h1>
            <p className="hero-text">
              Яркая математическая игра для детей: две команды, быстрые ответы,
              большой экран, дружелюбный персонаж и понятные подсказки без
              перегруза.
            </p>
          </div>
        </div>

        <div className="home-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={loading}
            onClick={() => void createRoom()}
          >
            {loading ? "Создаём комнату…" : "Новая игра (экран учителя)"}
          </button>
          <Link to="/teacher" className="btn btn-ghost" style={{ textDecoration: "none" }}>
            Справочник классов и ФИО (заранее)
          </Link>
          <Link to="/ratings" className="btn btn-ghost" style={{ textDecoration: "none" }}>
            Таблица рейтингов
          </Link>
        </div>

        <p style={{ marginTop: "1.2rem", fontSize: "0.95rem", color: "var(--muted)" }}>
          Ученики подключаются по QR-коду, выбирают команду и отвечают прямо со
          своих телефонов.
        </p>
      </div>
    </div>
  );
}
