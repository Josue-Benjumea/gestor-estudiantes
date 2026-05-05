import { Sun, Moon, Menu } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

/**
 * Topbar with theme toggle and mobile menu button.
 */
export default function Topbar({ title }) {
  const { theme, toggleTheme } = useThemeStore();

  const toggleSidebar = () => {
    document.getElementById('sidebar')?.classList.toggle('open');
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="btn-ghost btn-icon" onClick={toggleSidebar} style={{ display: 'none' }} id="menu-btn">
          <Menu size={20} />
        </button>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</h2>
      </div>
      <div className="topbar-right">
        <button className="theme-toggle" onClick={toggleTheme} title="Cambiar tema">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
}
