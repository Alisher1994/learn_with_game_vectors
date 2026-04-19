import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { HomePage } from "./pages/HomePage";
import { HostPage } from "./pages/HostPage";
import { JoinPage } from "./pages/JoinPage";
import { TeacherPage } from "./pages/TeacherPage";
import { RankingsPage } from "./pages/RankingsPage";
import { I18nProvider, type Lang, t } from "./i18n";

type ThemeMode = "dark" | "light";

export function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    const saved = window.localStorage.getItem("vector-theme");
    return saved === "light" ? "light" : "dark";
  });
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "ru";
    const saved = window.localStorage.getItem("vector-lang");
    return saved === "uz" ? "uz" : "ru";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("vector-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("vector-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const copy = t[lang];

  return (
    <I18nProvider value={{ lang, setLang }}>
      <div className="global-switches">
        <div className="lang-toggle" aria-label={copy.languageLabel}>
          <button
            type="button"
            className={`lang-toggle__btn ${lang === "ru" ? "lang-toggle__btn--active" : ""}`}
            onClick={() => setLang("ru")}
          >
            RU
          </button>
          <button
            type="button"
            className={`lang-toggle__btn ${lang === "uz" ? "lang-toggle__btn--active" : ""}`}
            onClick={() => setLang("uz")}
          >
            UZ
          </button>
        </div>

        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
          aria-label={theme === "dark" ? copy.lightTheme : copy.darkTheme}
        >
          <span className="theme-toggle__icon">{theme === "dark" ? "☀️" : "🌙"}</span>
          <span>{theme === "dark" ? copy.lightTheme : copy.darkTheme}</span>
        </button>
      </div>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/host/:roomId" element={<HostPage />} />
        <Route path="/join/:roomId" element={<JoinPage />} />
        <Route path="/join/:roomId/:team" element={<JoinPage />} />
        <Route path="/teacher" element={<TeacherPage />} />
        <Route path="/ratings" element={<RankingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </I18nProvider>
  );
}
