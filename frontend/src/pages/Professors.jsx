import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, Link2, X } from 'lucide-react';
import { usersApi, subjectsApi, groupsApi } from '../api';
import { useToastStore } from '../store/toastStore';
import Topbar from '../components/layout/Topbar';
import Modal from '../components/ui/Modal';

export default function Professors() {
  const [professors, setProfessors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', role: 'professor' });
  const [assignForm, setAssignForm] = useState({ subject_id: '', group_id: '' });
  const { addToast } = useToastStore();

  const load = async () => {
    try {
      const [pRes, sRes, gRes] = await Promise.all([
        usersApi.getProfessors(), subjectsApi.getAll(), groupsApi.getAll()
      ]);
      setProfessors(pRes.data.data);
      setSubjects(sRes.data.data);
      setGroups(gRes.data.data);
    } catch {
      addToast('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const { password, role, ...updateData } = form;
        await usersApi.update(editing.id, updateData);
        addToast('Profesor actualizado', 'success');
      } else {
        await usersApi.create(form);
        addToast('Profesor creado exitosamente', 'success');
      }
      setShowModal(false);
      setEditing(null);
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  const handleEdit = (prof) => {
    setEditing(prof);
    setForm({ first_name: prof.first_name, last_name: prof.last_name, email: prof.email, password: '', role: 'professor' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este profesor?')) return;
    try { await usersApi.delete(id); addToast('Profesor eliminado', 'success'); load(); }
    catch { addToast('Error al eliminar', 'error'); }
  };

  const handleAssign = async () => {
    if (!assignForm.subject_id || !assignForm.group_id) return;
    try {
      await usersApi.assignSubject(assignTarget.id, {
        subject_id: parseInt(assignForm.subject_id),
        group_id: parseInt(assignForm.group_id),
      });
      addToast('Materia asignada exitosamente', 'success');
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error al asignar', 'error');
    }
  };

  const handleRemoveAssignment = async (aId) => {
    try {
      await usersApi.removeAssignment(aId);
      addToast('Asignación eliminada', 'success');
      load();
    } catch { addToast('Error', 'error'); }
  };

  const openAssign = (prof) => {
    setAssignTarget(prof);
    setAssignForm({ subject_id: '', group_id: '' });
    setShowAssignModal(true);
  };

  const filtered = professors.filter((p) =>
    `${p.first_name} ${p.last_name} ${p.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Topbar title="Profesores" />
      <div className="page-container">
        <div className="flex-between page-header">
          <div>
            <h1 className="page-title">Profesores</h1>
            <p className="page-subtitle">{professors.length} profesores registrados</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ first_name: '', last_name: '', email: '', password: '', role: 'professor' }); setShowModal(true); }}>
            <Plus size={18} /> Nuevo Profesor
          </button>
        </div>

        <div style={{ marginBottom: 24, position: 'relative', maxWidth: 400 }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="form-input" placeholder="Buscar profesores..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
        </div>

        {loading ? (
          <div className="loader-container"><div className="spinner" /></div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {filtered.map((prof) => (
              <div key={prof.id} className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
                <div className="flex-between" style={{ marginBottom: prof.assignments?.length ? 12 : 0 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{prof.first_name} {prof.last_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{prof.email}</div>
                  </div>
                  <div className="flex-gap">
                    <button className="btn btn-sm btn-secondary" onClick={() => openAssign(prof)}><Link2 size={14} /> Asignar</button>
                    <button className="btn-ghost btn-icon" onClick={() => handleEdit(prof)}><Edit2 size={16} /></button>
                    <button className="btn-ghost btn-icon" onClick={() => handleDelete(prof.id)} style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button>
                  </div>
                </div>
                {prof.assignments?.length > 0 && (
                  <div className="flex-gap" style={{ flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    {prof.assignments.map((a) => (
                      <span key={a.id} className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {a.subject_name} — {a.group_name}
                        <button onClick={() => handleRemoveAssignment(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex' }}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && <div className="empty-state"><h3>No se encontraron profesores</h3></div>}
          </motion.div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Profesor' : 'Nuevo Profesor'}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Guardar' : 'Crear'}</button>
        </>}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input className="form-input" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Apellido</label>
              <input className="form-input" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          {!editing && (
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input type="password" className="form-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
          )}
        </form>
      </Modal>

      {/* Assign Subject Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Asignar Materia y Grupo"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleAssign}>Asignar</button>
        </>}
      >
        <p style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Asignar materia a <strong>{assignTarget?.first_name} {assignTarget?.last_name}</strong>:
        </p>
        <div className="form-group">
          <label className="form-label">Materia</label>
          <select className="form-input" value={assignForm.subject_id} onChange={(e) => setAssignForm({ ...assignForm, subject_id: e.target.value })}>
            <option value="">Seleccionar materia...</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Grupo</label>
          <select className="form-input" value={assignForm.group_id} onChange={(e) => setAssignForm({ ...assignForm, group_id: e.target.value })}>
            <option value="">Seleccionar grupo...</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      </Modal>
    </>
  );
}
