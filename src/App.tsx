import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { ThemeProvider } from './components/ThemeProvider';
import Login from './pages/Login';
import DashboardApp from './pages/DashboardApp';
import { InstallPrompt } from './components/InstallPrompt';
import { Toaster } from 'sonner';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardApp />
              </ProtectedRoute>
            } />
          </Routes>
          {/* Aparece globalmente se o usuário estiver no celular pelo navegador */}
          <InstallPrompt />
        </Router>
      </AuthProvider>
      <Toaster theme="system" position="bottom-center" />
    </ThemeProvider>
  );
}