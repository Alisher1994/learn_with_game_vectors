import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { VectorMascot } from "../components/VectorMascot";
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
      <div className="card" style={{ textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <VectorMascot mood="happy" size={100} />
          <div style={{ textAlign: "left", maxWidth: 420 }}>
            <h1 style={{ margin: "0 0 0.35rem", fontSize: "1.75rem" }}>
              Вектор-баттл
            </h1>
            <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.5 }}>
              Интерактивная игра-презентация по векторам для 7–8 класса. Две
              команды, вопросы на экране, ответы с телефонов — кто быстрее и
              точнее?
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.65rem",
            alignItems: "stretch",
            maxWidth: 360,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
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

        <p style={{ marginTop: "1.25rem", fontSize: "0.9rem", color: "var(--muted)" }}>
          Ученики заходят по QR-коду с экрана игры и выбирают синюю или красную
          команду.
        </p>
      </div>
    </div>
  );
}
