import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../socketUrl";

interface RankingEntry {
  id: string;
  createdAt: string;
  roomId: string;
  className: string;
  groupLabel: string;
  team: "blue" | "red";
  score: number;
  members: string[];
}

export function RankingsPage() {
  const [rows, setRows] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api<RankingEntry[]>("/api/rankings")
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="row" style={{ marginBottom: "1rem" }}>
        <Link to="/" className="btn btn-ghost" style={{ textDecoration: "none" }}>
          ← На главную
        </Link>
      </div>

      <div className="card">
        <h1 style={{ marginTop: 0, fontSize: "1.35rem" }}>Таблица рейтингов</h1>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>
          Сохраняются автоматически после каждой завершённой игры.
        </p>

        {loading && <p>Загрузка…</p>}

        {!loading && rows.length === 0 && (
          <p style={{ color: "var(--muted)" }}>Пока нет записей.</p>
        )}

        {!loading && rows.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.92rem",
              }}
            >
              <thead>
                <tr style={{ color: "var(--muted)", textAlign: "left" }}>
                  <th style={{ padding: "8px 6px" }}>Дата</th>
                  <th style={{ padding: "8px 6px" }}>Класс</th>
                  <th style={{ padding: "8px 6px" }}>Команда</th>
                  <th style={{ padding: "8px 6px" }}>Очки</th>
                  <th style={{ padding: "8px 6px" }}>Участники</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    style={{
                      borderTop: "1px solid rgba(148,163,184,0.12)",
                      color:
                        r.team === "blue" ? "var(--blue)" : "var(--red)",
                    }}
                  >
                    <td style={{ padding: "8px 6px", color: "var(--text)" }}>
                      {new Date(r.createdAt).toLocaleString("ru-RU")}
                    </td>
                    <td style={{ padding: "8px 6px", color: "var(--text)" }}>
                      {r.className}
                    </td>
                    <td style={{ padding: "8px 6px", fontWeight: 700 }}>
                      {r.groupLabel}
                    </td>
                    <td style={{ padding: "8px 6px", color: "var(--text)" }}>
                      {r.score}
                    </td>
                    <td style={{ padding: "8px 6px", color: "var(--muted)" }}>
                      {r.members.filter(Boolean).join(", ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
