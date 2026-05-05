import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

/**
 * Main application layout with sidebar + content area.
 */
export default function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
