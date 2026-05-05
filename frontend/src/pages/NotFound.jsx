import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import appLogo from '../assets/Logo.png';

export default function NotFound() {
  return (
    <div className="auth-page">
      <motion.div
        className="glass-card"
        style={{ textAlign: 'center', padding: 60, maxWidth: 420 }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <img src={appLogo} alt="EduManager" style={{ height: 48, marginBottom: 16 }} />
        <div style={{ fontSize: '4rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          404
        </div>
        <h2 style={{ fontWeight: 700, marginTop: 8, marginBottom: 8 }}>Página no encontrada</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
          La página que buscas no existe o fue movida.
        </p>
        <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <Home size={18} /> Volver al inicio
        </Link>
      </motion.div>
    </div>
  );
}
