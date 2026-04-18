import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { HostPage } from "./pages/HostPage";
import { JoinPage } from "./pages/JoinPage";
import { TeacherPage } from "./pages/TeacherPage";
import { RankingsPage } from "./pages/RankingsPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/host/:roomId" element={<HostPage />} />
      <Route path="/join/:roomId/:team" element={<JoinPage />} />
      <Route path="/teacher" element={<TeacherPage />} />
      <Route path="/ratings" element={<RankingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
