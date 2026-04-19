import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { nanoid } from "nanoid";
import type { ClassEntry } from "@shared/types";
import { api } from "../socketUrl";
import { t, useI18n } from "../i18n";

export function TeacherPage() {
  const [classes, setClasses] = useState<ClassEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const { lang } = useI18n();
  const copy = t[lang];

  useEffect(() => {
    void api<ClassEntry[]>("/api/classes")
      .then(setClasses)
      .catch(() => setClasses([]))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setSaveMessage("");
    setSaveError("");
    try {
      await api("/api/classes", {
        method: "PUT",
        body: JSON.stringify({ classes }),
      });
      setSaveMessage(
        lang === "uz"
          ? "O'zgarishlar saqlandi."
          : "Изменения сохранены.",
      );
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : lang === "uz"
            ? "Saqlashda xatolik yuz berdi."
            : "Ошибка при сохранении.",
      );
    } finally {
      setSaving(false);
    }
  }

  function addClass() {
    setSaveMessage("");
    setSaveError("");
    setClasses((c) => [
      ...c,
      { id: nanoid(10), name: copy.newClass, students: [""] },
    ]);
  }

  function updateClass(id: string, name: string) {
    setSaveMessage("");
    setSaveError("");
    setClasses((list) =>
      list.map((x) => (x.id === id ? { ...x, name } : x)),
    );
  }

  function removeClass(id: string) {
    setSaveMessage("");
    setSaveError("");
    setClasses((list) => list.filter((x) => x.id !== id));
  }

  function addStudent(classId: string) {
    setSaveMessage("");
    setSaveError("");
    setClasses((list) =>
      list.map((c) =>
        c.id === classId ? { ...c, students: [...c.students, ""] } : c,
      ),
    );
  }

  function setStudent(classId: string, index: number, value: string) {
    setSaveMessage("");
    setSaveError("");
    setClasses((list) =>
      list.map((c) => {
        if (c.id !== classId) return c;
        const students = [...c.students];
        students[index] = value;
        return { ...c, students };
      }),
    );
  }

  function removeStudent(classId: string, index: number) {
    setSaveMessage("");
    setSaveError("");
    setClasses((list) =>
      list.map((c) => {
        if (c.id !== classId) return c;
        const students = c.students.filter((_, i) => i !== index);
        return { ...c, students };
      }),
    );
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card">{copy.loading}</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="row" style={{ marginBottom: "1rem" }}>
        <Link to="/" className="btn btn-ghost" style={{ textDecoration: "none" }}>
          {copy.backHome}
        </Link>
      </div>

      <div className="card">
        <h1 style={{ marginTop: 0, fontSize: "1.35rem" }}>{copy.teacherTitle}</h1>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>{copy.teacherText}</p>

        {classes.map((cl) => (
          <div
            key={cl.id}
            style={{
              border: "1px solid rgba(148,163,184,0.15)",
              borderRadius: 12,
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div className="row" style={{ marginBottom: "0.75rem" }}>
              <input
                className="input"
                value={cl.name}
                onChange={(e) => updateClass(cl.id, e.target.value)}
                placeholder={
                  lang === "uz"
                    ? "Sinf nomi (masalan 8A)"
                    : "Название класса (например 8А)"
                }
                style={{ flex: 1, minWidth: 200 }}
              />
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => removeClass(cl.id)}
              >
                {copy.removeClass}
              </button>
            </div>
            <label className="label">{copy.students}</label>
            {cl.students.map((s, i) => (
              <div key={i} className="row" style={{ marginBottom: "0.35rem" }}>
                <input
                  className="input"
                  value={s}
                  onChange={(e) => setStudent(cl.id, i, e.target.value)}
                  placeholder={copy.studentName}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => removeStudent(cl.id, i)}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => addStudent(cl.id)}
            >
              {copy.addStudent}
            </button>
          </div>
        ))}

        <button type="button" className="btn btn-ghost" onClick={addClass}>
          {copy.addClass}
        </button>

        <div style={{ marginTop: "1.25rem" }}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? copy.saving : copy.save}
          </button>
          {saveMessage ? (
            <p style={{ margin: "0.75rem 0 0", color: "var(--ok)", fontWeight: 800 }}>
              {saveMessage}
            </p>
          ) : null}
          {saveError ? (
            <p style={{ margin: "0.75rem 0 0", color: "var(--red)", fontWeight: 800 }}>
              {saveError}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
