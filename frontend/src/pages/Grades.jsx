import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Save, Trash2, ChevronRight, ChevronLeft, Users, BookOpen, CheckCircle, X } from 'lucide-react';
import { activitiesApi, gradesApi, usersApi, periodsApi, subjectsApi, groupsApi } from '../api';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import Topbar from '../components/layout/Topbar';
import Modal from '../components/ui/Modal';

export default function Grades() {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [activitiesByPeriod, setActivitiesByPeriod] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradingActivity, setGradingActivity] = useState(null);
  const [activityStudents, setActivityStudents] = useState([]);
  const [gradeInputs, setGradeInputs] = useState({});
  const [savingGrades, setSavingGrades] = useState(false);

  // Create form
  const [createForm, setCreateForm] = useState({ name: '', description: '', subject_id: '', period_id: '', group_ids: [] });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [actRes, assignRes, periodRes, subRes, groupRes] = await Promise.all([
        activitiesApi.getMyActivities(),
        usersApi.getAssignments(user.id),
        periodsApi.getAll(),
        subjectsApi.getAll(),
        groupsApi.getAll(),
      ]);
      setActivitiesByPeriod(actRes.data.data);
      setAssignments(assignRes.data.data);
      setPeriods(periodRes.data.data);
      setSubjects(subRes.data.data);
      setGroups(groupRes.data.data);

      // Auto-select active period
      const active = periodRes.data.data.find((p) => p.is_active);
      if (active) setSelectedPeriod(active.id);
      else if (periodRes.data.data.length) setSelectedPeriod(periodRes.data.data[0].id);
    } catch {
      addToast('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get professor's unique groups and subjects from assignments
  const mySubjects = [...new Map(assignments.map((a) => [a.subject_id, { id: a.subject_id, name: a.subject_name }])).values()];
  const myGroups = [...new Map(assignments.map((a) => [a.group_id, { id: a.group_id, name: a.group_name }])).values()];

  // Filter activities by selected period
  const currentPeriodData = activitiesByPeriod.find((p) => p.period_id === selectedPeriod);
  const currentActivities = currentPeriodData?.activities || [];

  // ─── Create Activity ─────────────────────────────────────
  const handleCreateActivity = async () => {
    if (!createForm.name || !createForm.subject_id || !createForm.group_ids.length) {
      addToast('Completa todos los campos', 'warning');
      return;
    }
    const activePeriod = periods.find((p) => p.is_active);
    if (!activePeriod) {
      addToast('No hay periodo activo', 'error');
      return;
    }
    try {
      await activitiesApi.create({
        name: createForm.name,
        description: createForm.description,
        subject_id: parseInt(createForm.subject_id),
        period_id: activePeriod.id,
        group_ids: createForm.group_ids.map(Number),
      });
      addToast('Actividad creada exitosamente', 'success');
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '', subject_id: '', period_id: '', group_ids: [] });
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error al crear actividad', 'error');
    }
  };

  // ─── Open grading view for an activity ────────────────────
  const openGrading = async (activity) => {
    setGradingActivity(activity);
    try {
      const res = await activitiesApi.getStudents(activity.id);
      const students = res.data.data;
      setActivityStudents(students);

      // Pre-fill existing grades
      const inputs = {};
      students.forEach((s) => {
        inputs[s.student_id] = {
          grade: s.grade !== null && s.grade !== undefined ? s.grade.toString() : '',
          comments: s.comments || '',
        };
      });
      setGradeInputs(inputs);
      setShowGradeModal(true);
    } catch {
      addToast('Error al cargar estudiantes', 'error');
    }
  };

  // ─── Save all grades ──────────────────────────────────────
  const handleSaveGrades = async () => {
    const grades = Object.entries(gradeInputs)
      .filter(([, val]) => val.grade !== '')
      .map(([studentId, val]) => ({
        student_id: parseInt(studentId),
        grade: parseFloat(val.grade),
        comments: val.comments || null,
      }));

    if (grades.some((g) => isNaN(g.grade) || g.grade < 0 || g.grade > 100)) {
      addToast('Las notas deben estar entre 0 y 100', 'error');
      return;
    }

    setSavingGrades(true);
    try {
      await gradesApi.bulkGrade(gradingActivity.id, { grades });
      addToast(`${grades.length} calificaciones guardadas`, 'success');
      setShowGradeModal(false);
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error al guardar', 'error');
    } finally {
      setSavingGrades(false);
    }
  };

  // ─── Delete activity ──────────────────────────────────────
  const handleDeleteActivity = async (id) => {
    if (!confirm('¿Eliminar esta actividad y todas sus calificaciones?')) return;
    try {
      await activitiesApi.delete(id);
      addToast('Actividad eliminada', 'success');
      loadData();
    } catch {
      addToast('Error al eliminar', 'error');
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'var(--success)';
    if (grade >= 70) return 'var(--accent)';
    if (grade >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  const toggleGroupSelection = (gid) => {
    const str = gid.toString();
    setCreateForm((prev) => ({
      ...prev,
      group_ids: prev.group_ids.includes(str) ? prev.group_ids.filter((g) => g !== str) : [...prev.group_ids, str],
    }));
  };

  const activePeriod = periods.find((p) => p.is_active);

  return (
    <>
      <Topbar title="Actividades y Calificaciones" />
      <div className="page-container">
        <div className="flex-between page-header">
          <div>
            <h1 className="page-title">Actividades y Calificaciones</h1>
            <p className="page-subtitle">Crea actividades y califica a tus estudiantes</p>
          </div>
          {activePeriod && (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} /> Nueva Actividad
            </button>
          )}
        </div>

        {/* Period Tabs */}
        <div className="period-tabs">
          {periods.map((p) => (
            <button
              key={p.id}
              className={`period-tab ${selectedPeriod === p.id ? 'active' : ''}`}
              onClick={() => setSelectedPeriod(p.id)}
            >
              {p.name}
              {p.is_active ? <span className="period-badge" /> : null}
            </button>
          ))}
        </div>

        {!activePeriod && (
          <div className="glass-card" style={{ padding: 24, textAlign: 'center', color: 'var(--warning)' }}>
            ⚠️ No hay un periodo activo. Contacta al administrador para iniciar un periodo.
          </div>
        )}

        {loading ? (
          <div className="loader-container"><div className="spinner" /></div>
        ) : currentActivities.length === 0 ? (
          <div className="empty-state glass-card" style={{ padding: 60 }}>
            <BookOpen size={48} style={{ opacity: 0.3 }} />
            <h3>Sin actividades en este periodo</h3>
            <p>Crea una nueva actividad para comenzar a calificar</p>
          </div>
        ) : (
          <div className="grid-2">
            {currentActivities.map((activity, i) => (
              <motion.div
                key={activity.id}
                className="glass-card"
                style={{ padding: 20 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="flex-between" style={{ marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{activity.name}</h3>
                    <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{activity.subject_name}</span>
                  </div>
                  <div className="flex-gap">
                    <button className="btn-ghost btn-icon" onClick={() => handleDeleteActivity(activity.id)} style={{ color: 'var(--danger)' }} title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {activity.description && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{activity.description}</p>
                )}

                <div className="flex-gap" style={{ marginBottom: 12, fontSize: '0.8rem', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                  <span><Users size={14} /> {activity.grade_count}/{activity.student_count} calificados</span>
                </div>

                {/* Progress bar */}
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: 6, height: 6, marginBottom: 16, overflow: 'hidden' }}>
                  <div style={{
                    background: activity.grade_count >= activity.student_count ? 'var(--success)' : 'var(--accent)',
                    width: `${activity.student_count > 0 ? (activity.grade_count / activity.student_count) * 100 : 0}%`,
                    height: '100%', borderRadius: 6, transition: 'width 0.3s'
                  }} />
                </div>

                <button
                  className="btn btn-sm btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => openGrading(activity)}
                >
                  <Edit2 size={14} /> Calificar Estudiantes
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Create Activity Modal ─────────────────────────────── */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nueva Actividad"
        size="md"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleCreateActivity}>Crear Actividad</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Nombre de la Actividad</label>
          <input
            className="form-input"
            placeholder='Ej: "Examen Parcial 1", "Tarea de Álgebra"'
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Descripción (opcional)</label>
          <input
            className="form-input"
            placeholder="Breve descripción de la actividad"
            value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Materia</label>
          <select
            className="form-input"
            value={createForm.subject_id}
            onChange={(e) => setCreateForm({ ...createForm, subject_id: e.target.value })}
          >
            <option value="">Seleccionar materia...</option>
            {mySubjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Grupos</label>
          <div className="flex-gap" style={{ flexWrap: 'wrap', gap: 8 }}>
            {myGroups.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`badge ${createForm.group_ids.includes(g.id.toString()) ? 'badge-green' : 'badge-gray'}`}
                onClick={() => toggleGroupSelection(g.id)}
                style={{ cursor: 'pointer', border: 'none', padding: '6px 14px', fontSize: '0.85rem' }}
              >
                {createForm.group_ids.includes(g.id.toString()) && <CheckCircle size={14} />}
                {g.name}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 6 }}>
            Selecciona los grupos que realizarán esta actividad
          </div>
        </div>
      </Modal>

      {/* ─── Grade Students Modal ──────────────────────────────── */}
      <Modal
        isOpen={showGradeModal}
        onClose={() => setShowGradeModal(false)}
        title={gradingActivity ? `Calificar: ${gradingActivity.name}` : 'Calificar'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowGradeModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSaveGrades} disabled={savingGrades}>
              <Save size={16} /> {savingGrades ? 'Guardando...' : 'Guardar Todas'}
            </button>
          </>
        }
      >
        {gradingActivity && (
          <div style={{ marginBottom: 16, padding: 12, background: 'var(--bg-tertiary)', borderRadius: 10, fontSize: '0.85rem' }}>
            <strong>{gradingActivity.subject_name}</strong> · Notas de 0 a 100
          </div>
        )}

        <div className="table-container" style={{ maxHeight: 420, overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 200 }}>Estudiante</th>
                <th style={{ width: 80 }}>Grupo</th>
                <th style={{ width: 100 }}>Nota</th>
                <th>Comentario</th>
              </tr>
            </thead>
            <tbody>
              {activityStudents.map((s) => (
                <tr key={s.student_id}>
                  <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.first_name} {s.last_name}</td>
                  <td><span className="badge badge-blue">{s.group_name}</span></td>
                  <td>
                    <input
                      type="number"
                      className="form-input"
                      style={{
                        width: 80, padding: '6px 8px', textAlign: 'center', fontWeight: 700,
                        color: gradeInputs[s.student_id]?.grade
                          ? getGradeColor(parseFloat(gradeInputs[s.student_id].grade))
                          : undefined
                      }}
                      min="0" max="100" step="0.1"
                      placeholder="—"
                      value={gradeInputs[s.student_id]?.grade || ''}
                      onChange={(e) => setGradeInputs({
                        ...gradeInputs,
                        [s.student_id]: { ...gradeInputs[s.student_id], grade: e.target.value },
                      })}
                    />
                  </td>
                  <td>
                    <input
                      className="form-input"
                      style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                      placeholder="Opcional..."
                      value={gradeInputs[s.student_id]?.comments || ''}
                      onChange={(e) => setGradeInputs({
                        ...gradeInputs,
                        [s.student_id]: { ...gradeInputs[s.student_id], comments: e.target.value },
                      })}
                    />
                  </td>
                </tr>
              ))}
              {activityStudents.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
                    No hay estudiantes asignados a esta actividad
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
}
