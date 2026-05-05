import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Layers,
  ClipboardList, Calendar, LogOut, FileText, Settings
} from 'lucide-react';
import appLogo from '../../assets/Logo.png';

/**
 * Sidebar navigation — renders links based on user role.
 */
export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : '';
  const roleLabels = { admin: 'Super Admin', professor: 'Profesor', student: 'Estudiante' };

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-brand">
        <img src={appLogo} alt="EduManager" className="sidebar-logo" />
        <div>
          <h1>EduManager</h1>
          <p>Sistema de Gestión</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Admin Navigation */}
        {user?.role === 'admin' && (
          <>
            <div className="sidebar-section">
              <div className="sidebar-section-title">General</div>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard /> Dashboard
              </NavLink>
            </div>
            <div className="sidebar-section">
              <div className="sidebar-section-title">Gestión</div>
              <NavLink to="/students" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <GraduationCap /> Estudiantes
              </NavLink>
              <NavLink to="/professors" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Users /> Profesores
              </NavLink>
              <NavLink to="/subjects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <BookOpen /> Materias
              </NavLink>
              <NavLink to="/groups" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Layers /> Grupos
              </NavLink>
            </div>
            <div className="sidebar-section">
              <div className="sidebar-section-title">Académico</div>
              <NavLink to="/periods" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Calendar /> Periodos
              </NavLink>
            </div>
            <div className="sidebar-section">
              <div className="sidebar-section-title">Configuración</div>
              <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Settings /> Institución
              </NavLink>
            </div>
          </>
        )}

        {/* Professor Navigation */}
        {user?.role === 'professor' && (
          <>
            <div className="sidebar-section">
              <div className="sidebar-section-title">Mi Espacio</div>
              <NavLink to="/grades" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <ClipboardList /> Calificaciones
              </NavLink>
              <NavLink to="/my-students" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <GraduationCap /> Mis Estudiantes
              </NavLink>
            </div>
          </>
        )}

        {/* Student Navigation */}
        {user?.role === 'student' && (
          <>
            <div className="sidebar-section">
              <div className="sidebar-section-title">Mi Espacio</div>
              <NavLink to="/my-grades" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FileText /> Mis Notas
              </NavLink>
            </div>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.first_name} {user?.last_name}</div>
            <div className="sidebar-user-role">{roleLabels[user?.role] || user?.role}</div>
          </div>
        </div>
        <button className="nav-link" onClick={handleLogout} style={{ width: '100%', marginTop: 8, border: 'none', background: 'transparent' }}>
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
