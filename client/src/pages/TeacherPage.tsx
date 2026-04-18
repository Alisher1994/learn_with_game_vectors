import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { nanoid } from "nanoid";
import type { ClassEntry } from "@shared/types";
import { api } from "../socketUrl";

export function TeacherPage() {
  const [classes, setClasses] = useState<ClassEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void api<ClassEntry[]>("/api/classes")
      .then(setClasses)
      .catch(() => setClasses([]))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      await api("/api/classes", {
        method: "PUT",
        body: JSON.stringify({ classes }),
      });
    } finally {
      setSaving(false);
    }
  }

  function addClass() {
    setClasses((c) => [
      ...c,
      { id: nanoid(10), name: "Новый класс", students: [""] },
    ]);
  }

  function updateClass(id: string, name: string) {
    setClasses((list) =>
      list.map((x) => (x.id === id ? { ...x, name } : x)),
    );
  }

  function removeClass(id: string) {
    setClasses((list) => list.filter((x) => x.id !== id));
  }

  function addStudent(classId: string) {
    setClasses((list) =>
      list.map((c) =>
        c.id === classId ? { ...c, students: [...c.students, ""] } : c,
      ),
    );
  }

  function setStudent(classId: string, index: number, value: string) {
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
        <div className="card">Загрузка…</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="row" style={{ marginBottom: "1rem" }}>
        <Link to="/" className="btn btn-ghost" style={{ textDecoration: "none" }}>
          ← На главную
        </Link>
      </div>

      <div className="card">
        <h1 style={{ marginTop: 0, fontSize: "1.35rem" }}>
          Справочник классов и ФИО
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>
          Учитель заполняет список заранее. На телефонах ученики смогут выбрать
          класс и подставить фамилии одним нажатием.
        </p>

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
                placeholder="Название класса (например 8А)"
                style={{ flex: 1, minWidth: 200 }}
              />
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => removeClass(cl.id)}
              >
                Удалить класс
              </button>
            </div>
            <label className="label">Ученики</label>
            {cl.students.map((s, i) => (
              <div key={i} className="row" style={{ marginBottom: "0.35rem" }}>
                <input
                  className="input"
                  value={s}
                  onChange={(e) => setStudent(cl.id, i, e.target.value)}
                  placeholder="ФИО"
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
              + Ученик
            </button>
          </div>
        ))}

        <button type="button" className="btn btn-ghost" onClick={addClass}>
          + Класс
        </button>

        <div style={{ marginTop: "1.25rem" }}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}
