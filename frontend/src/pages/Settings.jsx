import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2, Building2, Image, Save, CheckCircle } from 'lucide-react';
import { settingsApi } from '../api';
import { useToastStore } from '../store/toastStore';
import Topbar from '../components/layout/Topbar';

const API_BASE = 'http://localhost:3001';

export default function InstitutionSettings() {
  const { addToast } = useToastStore();
  const fileRef = useRef(null);

  const [institutionName, setInstitutionName] = useState('');
  const [logoUrl, setLogoUrl] = useState(null);
  const [hasLogo, setHasLogo] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [nameRes, settingsRes] = await Promise.all([
        settingsApi.getInstitutionName(),
        settingsApi.getAll(),
      ]);
      setInstitutionName(nameRes.data.data);
      if (settingsRes.data.data.institution_logo) {
        setHasLogo(true);
        setLogoUrl(`${API_BASE}${settingsApi.getInstitutionLogo()}`);
      }
    } catch {
      // Settings not yet configured
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    setUploading(true);
    try {
      await settingsApi.uploadLogo(formData);
      addToast('Logo actualizado exitosamente', 'success');
      setHasLogo(true);
      setLogoUrl(`${API_BASE}${settingsApi.getInstitutionLogo()}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Error al subir logo', 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDeleteLogo = async () => {
    if (!confirm('¿Eliminar el logo de la institución?')) return;
    try {
      await settingsApi.deleteLogo();
      addToast('Logo eliminado', 'success');
      setHasLogo(false);
      setLogoUrl(null);
    } catch {
      addToast('Error al eliminar logo', 'error');
    }
  };

  const handleSaveName = async () => {
    if (!institutionName.trim()) {
      addToast('El nombre no puede estar vacío', 'warning');
      return;
    }
    setSaving(true);
    try {
      await settingsApi.updateInstitutionName(institutionName.trim());
      addToast('Nombre actualizado', 'success');
    } catch {
      addToast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Topbar title="Configuración" />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Configuración de Institución</h1>
          <p className="page-subtitle">Configura el logo y nombre de tu institución para los certificados</p>
        </div>

        <div className="grid-2">
          {/* Institution Name */}
          <motion.div
            className="glass-card"
            style={{ padding: 32 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div className="stat-icon purple"><Building2 size={22} /></div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Nombre de la Institución</h2>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Nombre</label>
              <input
                className="form-input"
                placeholder="Ej: Colegio San José"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
              />
            </div>

            <button className="btn btn-primary" onClick={handleSaveName} disabled={saving}>
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Nombre'}
            </button>
          </motion.div>

          {/* Institution Logo */}
          <motion.div
            className="glass-card"
            style={{ padding: 32 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div className="stat-icon blue"><Image size={22} /></div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Logo de la Institución</h2>
            </div>

            {/* Logo Preview */}
            <div style={{
              width: '100%',
              height: 160,
              borderRadius: 'var(--radius-md)',
              border: '2px dashed var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              background: 'var(--bg-tertiary)',
              overflow: 'hidden',
            }}>
              {hasLogo && logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo institución"
                  style={{ maxHeight: '140px', maxWidth: '100%', objectFit: 'contain' }}
                  onError={() => { setHasLogo(false); setLogoUrl(null); }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  <Image size={40} style={{ opacity: 0.3 }} />
                  <p style={{ fontSize: '0.8rem', marginTop: 8 }}>Sin logo configurado</p>
                </div>
              )}
            </div>

            <div className="flex-gap">
              <input
                type="file"
                ref={fileRef}
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                <Upload size={14} /> {uploading ? 'Subiendo...' : 'Subir Logo'}
              </button>
              {hasLogo && (
                <button className="btn btn-danger btn-sm" onClick={handleDeleteLogo}>
                  <Trash2 size={14} /> Eliminar
                </button>
              )}
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 12 }}>
              Formatos: PNG, JPG, WEBP, SVG. Máximo 5MB.
            </p>
          </motion.div>
        </div>

        {/* Preview of how certificate will look */}
        {hasLogo && (
          <motion.div
            className="glass-card"
            style={{ padding: 32, marginTop: 24, textAlign: 'center' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
              <CheckCircle size={18} style={{ color: 'var(--success)' }} />
              <span style={{ fontWeight: 600, color: 'var(--success)' }}>Vista previa del encabezado del certificado</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
              {logoUrl && <img src={logoUrl} alt="" style={{ height: 60, objectFit: 'contain' }} />}
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{institutionName || 'Institución Educativa'}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Certificado de Matrícula</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
