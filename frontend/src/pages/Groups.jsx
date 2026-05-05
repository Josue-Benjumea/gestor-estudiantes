import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Layers, Users } from 'lucide-react';
import { groupsApi } from '../api';
import { useToastStore } from '../store/toastStore';
import Topbar from '../components/layout/Topbar';
import Modal from '../components/ui/Modal';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const { addToast } = useToastStore();

  const load = async () => {
    try { const res = await groupsApi.getAll(); setGroups(res.data.data); }
    catch { addToast('Error al cargar grupos', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await groupsApi.update(editing.id, form); addToast('Grupo actualizado', 'success'); }
      else { await groupsApi.create(form); addToast('Grupo creado', 'success'); }
      setShowModal(false); setEditing(null); setForm({ name: '', description: '' }); load();
    } catch (err) { addToast(err.response?.data?.message || 'Error', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este grupo?')) return;
    try { await groupsApi.delete(id); addToast('Grupo eliminado', 'success'); load(); }
    catch { addToast('Error', 'error'); }
  };

  return (
    <>
      <Topbar title="Grupos" />
      <div className="page-container">
        <div className="flex-between page-header">
          <div>
            <h1 className="page-title">Grupos</h1>
            <p className="page-subtitle">{groups.length} grupos registrados</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ name: '', description: '' }); setShowModal(true); }}>
            <Plus size={18} /> Nuevo Grupo
          </button>
        </div>

        {loading ? (
          <div className="loader-container"><div className="spinner" /></div>
        ) : (
          <div className="grid-3">
            {groups.map((g, i) => (
              <motion.div key={g.id} className="glass-card" style={{ padding: 24 }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex-between" style={{ marginBottom: 12 }}>
                  <div className="stat-icon purple"><Layers size={20} /></div>
                  <div className="flex-gap">
                    <button className="btn-ghost btn-icon" onClick={() => { setEditing(g); setForm({ name: g.name, description: g.description || '' }); setShowModal(true); }}><Edit2 size={16} /></button>
                    <button className="btn-ghost btn-icon" onClick={() => handleDelete(g.id)} style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button>
                  </div>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.3rem' }}>{g.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>{g.description || 'Sin descripción'}</p>
                <div className="flex-gap" style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                  <Users size={14} /> {g.student_count || 0} estudiantes
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Grupo' : 'Nuevo Grupo'}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Guardar' : 'Crear'}</button>
        </>}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input className="form-input" placeholder="Ej: 6-A" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
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
