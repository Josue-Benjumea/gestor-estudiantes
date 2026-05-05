import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, GraduationCap, BookOpen, Layers, TrendingUp, TrendingDown, Award } from 'lucide-react';
import { dashboardApi } from '../api';
import Topbar from '../components/layout/Topbar';

const COLORS = ['#34c759', '#0071e3', '#ff9f0a', '#5856d6', '#ff3b30'];

const anim = (i) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.05, duration: 0.4 },
});

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getFull().then((res) => {
      setData(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <>
      <Topbar title="Dashboard" />
      <div className="loader-container"><div className="spinner" /></div>
    </>
  );

  if (!data) return null;

  const { stats, averagesBySubject, averagesByGroup, rankings, distribution } = data;

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Vista general del sistema académico</p>
        </div>

        {/* Stats Cards */}
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {[
            { icon: <GraduationCap size={22} />, label: 'Estudiantes', value: stats.total_students, color: 'blue' },
            { icon: <Users size={22} />, label: 'Profesores', value: stats.total_professors, color: 'purple' },
            { icon: <BookOpen size={22} />, label: 'Materias', value: stats.total_subjects, color: 'green' },
            { icon: <Award size={22} />, label: 'Promedio General', value: stats.overall_average || '—', color: 'orange' },
          ].map((stat, i) => (
            <motion.div key={stat.label} className="glass-card stat-card" {...anim(i)}>
              <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
              <div className="stat-info">
                <h3>{stat.label}</h3>
                <div className="stat-value">{stat.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid-2" style={{ marginBottom: 32 }}>
          {/* Average by Subject */}
          <motion.div className="glass-card chart-card" {...anim(4)}>
            <h3>Promedio por Materia</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={averagesBySubject} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
                    borderRadius: 12, fontSize: 13
                  }}
                />
                <Bar dataKey="average" fill="#0071e3" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Grade Distribution */}
          <motion.div className="glass-card chart-card" {...anim(5)}>
            <h3>Distribución de Notas</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={distribution}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={true}
                >
                  {distribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 12, fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Average by Group */}
        <motion.div className="glass-card chart-card" style={{ marginBottom: 32 }} {...anim(6)}>
          <h3>Promedio por Grupo</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={averagesByGroup} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 12, fontSize: 13 }} />
              <Bar dataKey="average" fill="#5856d6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Rankings */}
        <div className="grid-2">
          <motion.div className="glass-card" style={{ padding: 24 }} {...anim(7)}>
            <div className="flex-gap" style={{ marginBottom: 20 }}>
              <TrendingUp size={20} style={{ color: 'var(--success)' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Mejores Estudiantes</h3>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>#</th><th>Estudiante</th><th>Grupo</th><th>Promedio</th></tr>
                </thead>
                <tbody>
                  {rankings.top.map((s, i) => (
                    <tr key={s.id}>
                      <td><span className="badge badge-green">{i + 1}</span></td>
                      <td style={{ fontWeight: 600 }}>{s.first_name} {s.last_name}</td>
                      <td><span className="badge badge-blue">{s.group_name || '—'}</span></td>
                      <td style={{ fontWeight: 700, color: 'var(--success)' }}>{s.average}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div className="glass-card" style={{ padding: 24 }} {...anim(8)}>
            <div className="flex-gap" style={{ marginBottom: 20 }}>
              <TrendingDown size={20} style={{ color: 'var(--danger)' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Necesitan Refuerzo</h3>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>#</th><th>Estudiante</th><th>Grupo</th><th>Promedio</th></tr>
                </thead>
                <tbody>
                  {rankings.bottom.map((s, i) => (
                    <tr key={s.id}>
                      <td><span className="badge badge-red">{i + 1}</span></td>
                      <td style={{ fontWeight: 600 }}>{s.first_name} {s.last_name}</td>
                      <td><span className="badge badge-blue">{s.group_name || '—'}</span></td>
                      <td style={{ fontWeight: 700, color: 'var(--danger)' }}>{s.average}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
