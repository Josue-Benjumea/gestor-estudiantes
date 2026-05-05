import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Play, Square, Trash2, Edit2, Calendar, CheckCircle } from 'lucide-react';
import { periodsApi } from '../api';
import { useToastStore } from '../store/toastStore';
import Topbar from '../components/layout/Topbar';
import Modal from '../components/ui/Modal';

export default function Periods() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', start_date: '', end_date: '' });
  const { addToast } = useToastStore();

  const load = async () => {
    try { const res = await periodsApi.getAll(); setPeriods(res.data.data); }
    catch { addToast('Error al cargar periodos', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await periodsApi.update(editing.id, form); addToast('Periodo actualizado', 'success'); }
      else { await periodsApi.create(form); addToast('Periodo creado', 'success'); }
      setShowModal(false); setEditing(null); setForm({ name: '', description: '', start_date: '', end_date: '' }); load();
    } catch (err) { addToast(err.response?.data?.message || 'Error', 'error'); }
  };

  const handleActivate = async (id) => {
    try { await periodsApi.activate(id); addToast('Periodo iniciado', 'success'); load(); }
    catch (err) { addToast(err.response?.data?.message || 'Error', 'error'); }
  };

  const handleDeactivate = async (id) => {
    try { await periodsApi.deactivate(id); addToast('Periodo finalizado', 'success'); load(); }
    catch (err) { addToast(err.response?.data?.message || 'Error', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este periodo?')) return;
    try { await periodsApi.delete(id); addToast('Periodo eliminado', 'success'); load(); }
    catch (err) { addToast(err.response?.data?.message || 'Error al eliminar', 'error'); }
  };

  return (
    <>
      <Topbar title="Periodos Académicos" />
      <div className="page-container">
        <div className="flex-between page-header">
          <div>
            <h1 className="page-title">Periodos Académicos</h1>
            <p className="page-subtitle">Gestiona los periodos de calificaciones</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ name: '', description: '', start_date: '', end_date: '' }); setShowModal(true); }}>
            <Plus size={18} /> Nuevo Periodo
          </button>
        </div>

        {loading ? (
          <div className="loader-container"><div className="spinner" /></div>
        ) : (
          <div className="grid-2">
            {periods.map((p, i) => (
              <motion.div
                key={p.id}
                className="glass-card"
                style={{ padding: 24, border: p.is_active ? '2px solid var(--success)' : undefined }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex-between" style={{ marginBottom: 16 }}>
                  <div className="flex-gap">
                    <div className={`stat-icon ${p.is_active ? 'green' : 'blue'}`}>
                      {p.is_active ? <CheckCircle size={20} /> : <Calendar size={20} />}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{p.name}</h3>
                      {p.is_active && <span className="badge badge-green" style={{ marginTop: 4 }}>Activo</span>}
                    </div>
                  </div>
                  <div className="flex-gap">
                    <button className="btn-ghost btn-icon" onClick={() => { setEditing(p); setForm({ name: p.name, description: p.description || '', start_date: p.start_date || '', end_date: p.end_date || '' }); setShowModal(true); }}>
                      <Edit2 size={16} />
                    </button>
                    {!p.is_active && (
                      <button className="btn-ghost btn-icon" onClick={() => handleDelete(p.id)} style={{ color: 'var(--danger)' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                  {p.description || 'Sin descripción'}
                </p>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 16 }}>
                  {p.start_date && <span>Inicio: {new Date(p.start_date).toLocaleDateString('es-CO')}</span>}
                  {p.start_date && p.end_date && <span> · </span>}
                  {p.end_date && <span>Fin: {new Date(p.end_date).toLocaleDateString('es-CO')}</span>}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 16 }}>
                  📊 {p.grade_count || 0} calificaciones registradas
                </div>

                <div className="flex-gap">
                  {!p.is_active ? (
                    <button className="btn btn-sm btn-success" onClick={() => handleActivate(p.id)}>
                      <Play size={14} /> Iniciar Periodo
                    </button>
                  ) : (
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeactivate(p.id)}>
                      <Square size={14} /> Finalizar Periodo
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Periodo' : 'Nuevo Periodo'}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Guardar' : 'Crear'}</button>
        </>}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input className="form-input" placeholder="Ej: Periodo 1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <input className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha Inicio</label>
              <input type="date" className="form-input" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha Fin</label>
              <input type="date" className="form-input" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
