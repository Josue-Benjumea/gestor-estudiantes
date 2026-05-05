import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import appLogo from '../assets/Logo.png';
import { authApi } from '../api';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

export default function Register() {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.register(form);
      setAuth(data.data.user, data.data.token);
      addToast('¡Cuenta creada exitosamente!', 'success');
      navigate('/my-grades');
    } catch (err) {
      const msg = err.response?.data?.errors
        ? err.response.data.errors.map((e) => e.message).join(', ')
        : err.response?.data?.message || 'Error al registrarse';
      addToast(msg, 'error');
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
          <p>Crea tu cuenta de estudiante</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input className="form-input" name="first_name" placeholder="Juan" value={form.first_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Apellido</label>
              <input className="form-input" name="last_name" placeholder="Pérez" value={form.last_name} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" name="email" placeholder="correo@escuela.com" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input type="password" className="form-input" name="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={handleChange} required />
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
              Al menos 6 caracteres, 1 mayúscula y 1 número
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: '0.9rem', marginTop: 8 }}>
            <UserPlus size={18} />
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </motion.div>
    </div>
  );
}
