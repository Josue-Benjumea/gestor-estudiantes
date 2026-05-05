import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import { subjectsApi } from '../api';
import { useToastStore } from '../store/toastStore';
import Topbar from '../components/layout/Topbar';
import Modal from '../components/ui/Modal';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const { addToast } = useToastStore();

  const load = async () => {
    try { const res = await subjectsApi.getAll(); setSubjects(res.data.data); }
    catch { addToast('Error al cargar materias', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await subjectsApi.update(editing.id, form);
        addToast('Materia actualizada', 'success');
      } else {
        await subjectsApi.create(form);
        addToast('Materia creada', 'success');
      }
      setShowModal(false); setEditing(null); setForm({ name: '', description: '' }); load();
    } catch (err) { addToast(err.response?.data?.message || 'Error', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta materia?')) return;
    try { await subjectsApi.delete(id); addToast('Materia eliminada', 'success'); load(); }
    catch { addToast('Error', 'error'); }
  };

  return (
    <>
      <Topbar title="Materias" />
      <div className="page-container">
        <div className="flex-between page-header">
          <div>
            <h1 className="page-title">Materias</h1>
            <p className="page-subtitle">{subjects.length} materias registradas</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ name: '', description: '' }); setShowModal(true); }}>
            <Plus size={18} /> Nueva Materia
          </button>
        </div>

        {loading ? (
          <div className="loader-container"><div className="spinner" /></div>
        ) : (
          <div className="grid-3">
            {subjects.map((s, i) => (
              <motion.div key={s.id} className="glass-card" style={{ padding: 24 }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex-between" style={{ marginBottom: 12 }}>
                  <div className="stat-icon blue"><BookOpen size={20} /></div>
                  <div className="flex-gap">
                    <button className="btn-ghost btn-icon" onClick={() => { setEditing(s); setForm({ name: s.name, description: s.description || '' }); setShowModal(true); }}><Edit2 size={16} /></button>
                    <button className="btn-ghost btn-icon" onClick={() => handleDelete(s.id)} style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button>
                  </div>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{s.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>{s.description || 'Sin descripción'}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Materia' : 'Nueva Materia'}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Guardar' : 'Crear'}</button>
        </>}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <input className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </form>
      </Modal>
    </>
  );
}
