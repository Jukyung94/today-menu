import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { ModePage } from "./pages/ModePage";
import { RecommendationPage } from "./pages/RecommendationPage";
import { WelcomePage } from "./pages/WelcomePage";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/mode" element={<ModePage />} />
        <Route path="/recommend" element={<RecommendationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
