
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import DebtsPage from "./pages/DebtsPage";
import ReportsPage from "./pages/ReportsPage";
import CategoriesPage from "./pages/CategoriesPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/debts" element={<DebtsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
