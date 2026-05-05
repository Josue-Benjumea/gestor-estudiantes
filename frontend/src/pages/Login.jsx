import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import appLogo from '../assets/Logo.png';
import { authApi } from '../api';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      setAuth(data.data.user, data.data.token);
      addToast(`¡Bienvenido, ${data.data.user.first_name}!`, 'success');
      const routes = { admin: '/dashboard', professor: '/grades', student: '/my-grades' };
      navigate(routes[data.data.user.role] || '/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Error al iniciar sesión', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card glass-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="auth-logo">
          <img src={appLogo} alt="EduManager" style={{ height: 48, marginBottom: 8 }} />
          <h1>EduManager</h1>
          <p>Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="correo@escuela.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              id="login-email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id="login-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer'
                }}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            id="login-submit"
            style={{ width: '100%', padding: '12px', fontSize: '0.9rem', marginTop: 8 }}
          >
            <LogIn size={18} />
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="auth-footer">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </div>
      </motion.div>
    </div>
  );
}
