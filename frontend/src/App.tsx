import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RulesPage from './pages/RulesPage';
import PermissionsPage from './pages/PermissionsPage';
import ExamPage from './pages/ExamPage';
import ResultPage from './pages/ResultPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ResultsPage from './pages/admin/ResultsPage';
import QuestionsPage from './pages/admin/QuestionsPage';
import TestsPage from './pages/admin/TestsPage';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

function RequireTrainer({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isTrainer } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isTrainer) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Student flow */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/rules" element={<RequireAuth><RulesPage /></RequireAuth>} />
      <Route path="/permissions" element={<RequireAuth><PermissionsPage /></RequireAuth>} />
      <Route path="/exam" element={<RequireAuth><ExamPage /></RequireAuth>} />
      <Route path="/result/:attemptId" element={<RequireAuth><ResultPage /></RequireAuth>} />

      {/* Admin flow */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<RequireTrainer><DashboardPage /></RequireTrainer>} />
      <Route path="/admin/results" element={<RequireTrainer><ResultsPage /></RequireTrainer>} />
      <Route path="/admin/questions" element={<RequireTrainer><QuestionsPage /></RequireTrainer>} />
      <Route path="/admin/tests" element={<RequireTrainer><TestsPage /></RequireTrainer>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#161628',
              color: '#fff',
              border: '1px solid #1e1e3a',
              borderRadius: '12px',
              fontSize: '14px',
            },
            duration: 4000,
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
