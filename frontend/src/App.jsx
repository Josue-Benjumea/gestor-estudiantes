import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import ToastContainer from './components/ui/Toast';
import AppLayout from './components/layout/AppLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Professors from './pages/Professors';
import Subjects from './pages/Subjects';
import Groups from './pages/Groups';
import Periods from './pages/Periods';
import Grades from './pages/Grades';
import MyGrades from './pages/MyGrades';
import MyStudents from './pages/MyStudents';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

/**
 * Protected Route wrapper — redirects to login if not authenticated.
 * Optionally checks for allowed roles.
 */
function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/login" replace />;

  return children;
}

/**
 * Guest Route — redirects authenticated users to their dashboard.
 */
function GuestRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    const routes = { admin: '/dashboard', professor: '/grades', student: '/my-grades' };
    return <Navigate to={routes[user?.role] || '/dashboard'} replace />;
  }

  return children;
}

export default function App() {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Protected routes with layout */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          {/* Admin routes */}
          <Route path="/dashboard" element={<ProtectedRoute roles={['admin']}><Dashboard /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute roles={['admin']}><Students /></ProtectedRoute>} />
          <Route path="/professors" element={<ProtectedRoute roles={['admin']}><Professors /></ProtectedRoute>} />
          <Route path="/subjects" element={<ProtectedRoute roles={['admin']}><Subjects /></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute roles={['admin']}><Groups /></ProtectedRoute>} />
          <Route path="/periods" element={<ProtectedRoute roles={['admin']}><Periods /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute roles={['admin']}><Settings /></ProtectedRoute>} />

          {/* Professor routes */}
          <Route path="/grades" element={<ProtectedRoute roles={['professor']}><Grades /></ProtectedRoute>} />
          <Route path="/my-students" element={<ProtectedRoute roles={['professor']}><MyStudents /></ProtectedRoute>} />

          {/* Student routes */}
          <Route path="/my-grades" element={<ProtectedRoute roles={['student']}><MyGrades /></ProtectedRoute>} />
        </Route>

        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
