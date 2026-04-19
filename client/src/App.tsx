import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { HomePage } from "./pages/HomePage";
import { HostPage } from "./pages/HostPage";
import { JoinPage } from "./pages/JoinPage";
import { TeacherPage } from "./pages/TeacherPage";
import { RankingsPage } from "./pages/RankingsPage";

type ThemeMode = "dark" | "light";

export function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    const saved = window.localStorage.getItem("vector-theme");
    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("vector-theme", theme);
  }, [theme]);

  return (
    <>
      <button
        type="button"
        className="theme-toggle"
        onClick={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
        aria-label={
          theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"
        }
      >
        <span className="theme-toggle__icon">{theme === "dark" ? "☀️" : "🌙"}</span>
        <span>{theme === "dark" ? "Светлая тема" : "Тёмная тема"}</span>
      </button>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/host/:roomId" element={<HostPage />} />
        <Route path="/join/:roomId/:team" element={<JoinPage />} />
        <Route path="/teacher" element={<TeacherPage />} />
        <Route path="/ratings" element={<RankingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
