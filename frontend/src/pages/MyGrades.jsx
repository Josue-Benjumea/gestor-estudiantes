import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Award, TrendingUp, BookOpen, ChevronRight, ChevronLeft, BarChart3 } from 'lucide-react';
import { gradesApi } from '../api';
import Topbar from '../components/layout/Topbar';

export default function MyGrades() {
  const [gradesByPeriod, setGradesByPeriod] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gradesApi.getMyGrades().then((res) => {
      const data = res.data.data;
      setGradesByPeriod(data);
      const active = data.find((p) => p.is_active);
      if (active) setSelectedPeriod(active.period_id);
      else if (data.length) setSelectedPeriod(data[0].period_id);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const currentPeriod = gradesByPeriod.find((p) => p.period_id === selectedPeriod);
  const subjects = currentPeriod?.subjects || [];

  // Overall average for the period
  const periodAverage = subjects.length > 0
    ? (subjects.reduce((sum, s) => sum + s.average, 0) / subjects.length).toFixed(1)
    : '—';

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'var(--success)';
    if (grade >= 70) return 'var(--accent)';
    if (grade >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getGradeBadge = (grade) => {
    if (grade >= 90) return { text: 'Excelente', class: 'badge-green' };
    if (grade >= 80) return { text: 'Muy Bien', class: 'badge-blue' };
    if (grade >= 70) return { text: 'Bien', class: 'badge-purple' };
    if (grade >= 60) return { text: 'Aceptable', class: 'badge-orange' };
    return { text: 'Insuficiente', class: 'badge-red' };
  };

  // ─── Subject Detail View ──────────────────────────────────
  if (selectedSubject) {
    const subject = subjects.find((s) => s.subject_id === selectedSubject);
    if (!subject) { setSelectedSubject(null); return null; }

    return (
      <>
        <Topbar title={subject.subject_name} />
        <div className="page-container">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setSelectedSubject(null)}
            style={{ marginBottom: 20 }}
          >
            <ChevronLeft size={16} /> Volver a Materias
          </button>

          <div className="page-header">
            <h1 className="page-title">{subject.subject_name}</h1>
            <p className="page-subtitle">Profesor: {subject.professor}</p>
          </div>

          {/* Summary Cards */}
          <div className="grid-3" style={{ marginBottom: 32 }}>
            <motion.div className="glass-card stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="stat-icon blue"><Award size={22} /></div>
              <div className="stat-info">
                <h3>Promedio</h3>
                <div className="stat-value" style={{ color: getGradeColor(subject.average) }}>{subject.average}</div>
              </div>
            </motion.div>
            <motion.div className="glass-card stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <div className="stat-icon green"><TrendingUp size={22} /></div>
              <div className="stat-info">
                <h3>Nota Más Alta</h3>
                <div className="stat-value" style={{ color: 'var(--success)' }}>
                  {Math.max(...subject.activities.map((a) => a.grade))}
                </div>
              </div>
            </motion.div>
            <motion.div className="glass-card stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="stat-icon orange"><BarChart3 size={22} /></div>
              <div className="stat-info">
                <h3>Actividades</h3>
                <div className="stat-value">{subject.activities.length}</div>
              </div>
            </motion.div>
          </div>

          {/* Activity Grades Table */}
          <motion.div className="glass-card table-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <table>
              <thead>
                <tr>
                  <th>Actividad</th>
                  <th>Nota</th>
                  <th>Calificación</th>
                  <th>Comentarios</th>
                </tr>
              </thead>
              <tbody>
                {subject.activities.map((activity) => {
                  const b = getGradeBadge(activity.grade);
                  return (
                    <tr key={activity.activity_id}>
                      <td style={{ fontWeight: 600 }}>{activity.activity_name}</td>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: getGradeColor(activity.grade) }}>
                          {activity.grade}
                        </span>
                      </td>
                      <td><span className={`badge ${b.class}`}>{b.text}</span></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {activity.comments || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        </div>
      </>
    );
  }

  // ─── Main View: Subject List ──────────────────────────────
  return (
    <>
      <Topbar title="Mis Notas" />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Mis Notas</h1>
          <p className="page-subtitle">Consulta tus promedios por materia y calificaciones por actividad</p>
        </div>

        {/* Period Tabs */}
        {gradesByPeriod.length > 0 && (
          <div className="period-tabs">
            {gradesByPeriod.map((p) => (
              <button
                key={p.period_id}
                className={`period-tab ${selectedPeriod === p.period_id ? 'active' : ''}`}
                onClick={() => { setSelectedPeriod(p.period_id); setSelectedSubject(null); }}
              >
                {p.period_name}
                {p.is_active ? <span className="period-badge" /> : null}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="loader-container"><div className="spinner" /></div>
        ) : gradesByPeriod.length === 0 ? (
          <div className="empty-state glass-card" style={{ padding: 60 }}>
            <FileText size={48} style={{ opacity: 0.3 }} />
            <h3>Sin calificaciones</h3>
            <p>Aún no tienes notas registradas</p>
          </div>
        ) : (
          <>
            {/* Period Summary */}
            <div className="grid-3" style={{ marginBottom: 32 }}>
              <motion.div className="glass-card stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="stat-icon blue"><Award size={22} /></div>
                <div className="stat-info">
                  <h3>Promedio General</h3>
                  <div className="stat-value" style={{ color: !isNaN(periodAverage) ? getGradeColor(parseFloat(periodAverage)) : undefined }}>
                    {periodAverage}
                  </div>
                </div>
              </motion.div>
              <motion.div className="glass-card stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <div className="stat-icon purple"><BookOpen size={22} /></div>
                <div className="stat-info">
                  <h3>Materias</h3>
                  <div className="stat-value">{subjects.length}</div>
                </div>
              </motion.div>
              <motion.div className="glass-card stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="stat-icon green"><BarChart3 size={22} /></div>
                <div className="stat-info">
                  <h3>Actividades</h3>
                  <div className="stat-value">{subjects.reduce((sum, s) => sum + s.activities.length, 0)}</div>
                </div>
              </motion.div>
            </div>

            {/* Subject Cards */}
            <div className="grid-2">
              {subjects.map((subject, i) => {
                const b = getGradeBadge(subject.average);
                return (
                  <motion.div
                    key={subject.subject_id}
                    className="glass-card subject-card"
                    style={{ padding: 24, cursor: 'pointer', transition: 'transform 0.15s' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedSubject(subject.subject_id)}
                  >
                    <div className="flex-between" style={{ marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>{subject.subject_name}</h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Prof. {subject.professor}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.8rem', color: getGradeColor(subject.average), lineHeight: 1 }}>
                          {subject.average}
                        </div>
                        <span className={`badge ${b.class}`} style={{ marginTop: 4 }}>{b.text}</span>
                      </div>
                    </div>

                    {/* Mini activity list */}
                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 12 }}>
                      {subject.activities.slice(0, 3).map((a) => (
                        <div key={a.activity_id} className="flex-between" style={{ marginBottom: 6, fontSize: '0.8rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{a.activity_name}</span>
                          <span style={{ fontWeight: 700, color: getGradeColor(a.grade) }}>{a.grade}</span>
                        </div>
                      ))}
                      {subject.activities.length > 3 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                          +{subject.activities.length - 3} más...
                        </div>
                      )}
                    </div>

                    <div className="flex-between" style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--accent)' }}>
                      <span>{subject.activities.length} actividades</span>
                      <ChevronRight size={16} />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {subjects.length === 0 && (
              <div className="empty-state glass-card" style={{ padding: 40 }}>
                <BookOpen size={40} style={{ opacity: 0.3 }} />
                <h3>Sin notas en este periodo</h3>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
