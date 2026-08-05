import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { AuthPage } from './pages/AuthPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { useSocket } from './hooks/useSocket.js';

export default function App() {
  const { user, loading, login, register, logout, token } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem('noticeboard_theme') || 'dark');
  const { connected } = useSocket(token);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('noticeboard_theme', theme);
  }, [theme]);

  if (loading) {
    return <div className="loading-screen">Loading NoticeBoard...</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<AuthPage onLogin={login} onRegister={register} />} />
      </Routes>
    );
  }

  return (
    <AppShell
      user={user}
      connected={connected}
      theme={theme}
      onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
      onLogout={logout}
    >
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
