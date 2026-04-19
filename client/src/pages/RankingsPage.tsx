import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../socketUrl";
import { t, useI18n } from "../i18n";

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
  const { lang } = useI18n();
  const copy = t[lang];

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
          {copy.backHome}
        </Link>
      </div>

      <div className="card">
        <h1 style={{ marginTop: 0, fontSize: "1.8rem" }}>{copy.rankingsTitle}</h1>
        <p style={{ color: "var(--muted)", marginTop: 0, lineHeight: 1.5 }}>{copy.rankingsText}</p>

        {loading && <p>{copy.loading}</p>}

        {!loading && rows.length === 0 && (
          <p style={{ color: "var(--muted)" }}>{copy.noRecords}</p>
        )}

        {!loading && rows.length > 0 && (
          <div className="ranking-grid">
            {rows.map((r, index) => {
              const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`;
              return (
                <div
                  key={r.id}
                  className={`ranking-card ranking-card--${r.team}`}
                  style={{ color: r.team === "blue" ? "var(--blue)" : "var(--red)" }}
                >
                  <div className="ranking-head">
                    <div style={{ display: "flex", gap: "0.85rem", alignItems: "center" }}>
                      <div className="ranking-medal">{medal}</div>
                      <div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 900 }}>
                          {r.groupLabel || (r.team === "blue" ? copy.blueTeam : copy.redTeam)}
                        </div>
                        <div style={{ color: "var(--muted)", marginTop: 4 }}>
                          {new Date(r.createdAt).toLocaleString(lang === "uz" ? "uz-UZ" : "ru-RU")}
                        </div>
                      </div>
                    </div>
                    <div className="ranking-score">{r.score} {copy.points}</div>
                  </div>

                  <div className="ranking-meta">
                    <div className="ranking-meta__item">
                      <span className="ranking-meta__label">{copy.classWord}</span>
                      <span className="ranking-meta__value">{r.className || "—"}</span>
                    </div>
                    <div className="ranking-meta__item">
                      <span className="ranking-meta__label">{copy.roomWord}</span>
                      <span className="ranking-meta__value">{r.roomId}</span>
                    </div>
                  </div>

                  <div className="ranking-members">
                    {(r.members.filter(Boolean).length
                      ? r.members.filter(Boolean)
                      : [copy.membersMissing]).map((member, memberIndex) => (
                      <span key={`${r.id}-${memberIndex}`} className="ranking-member">
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
