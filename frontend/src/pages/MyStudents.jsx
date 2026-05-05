import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { usersApi } from '../api';
import { useAuthStore } from '../store/authStore';
import Topbar from '../components/layout/Topbar';

export default function MyStudents() {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getAssignments(user.id).then((res) => {
      setAssignments(res.data.data);
      if (res.data.data.length) {
        setSelectedGroup(res.data.data[0].group_id.toString());
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      usersApi.getStudentsByGroup(selectedGroup).then((res) => {
        setStudents(res.data.data);
      }).catch(() => setStudents([]));
    }
  }, [selectedGroup]);

  const myGroups = [...new Map(assignments.map((a) => [a.group_id, { id: a.group_id, name: a.group_name }])).values()];

  return (
    <>
      <Topbar title="Mis Estudiantes" />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Mis Estudiantes</h1>
          <p className="page-subtitle">Estudiantes asignados a tus grupos</p>
        </div>

        <div className="period-tabs" style={{ marginBottom: 24 }}>
          {myGroups.map((g) => (
            <button
              key={g.id}
              className={`period-tab ${selectedGroup === g.id.toString() ? 'active' : ''}`}
              onClick={() => setSelectedGroup(g.id.toString())}
            >
              {g.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loader-container"><div className="spinner" /></div>
        ) : (
          <motion.div className="glass-card table-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <table>
              <thead>
                <tr><th>#</th><th>Nombre</th><th>Email</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{s.first_name} {s.last_name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                    <td><span className={`badge ${s.is_active ? 'badge-green' : 'badge-red'}`}>{s.is_active ? 'Activo' : 'Inactivo'}</span></td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
                    <GraduationCap size={32} style={{ opacity: 0.3, marginBottom: 8 }} /><br />No hay estudiantes en este grupo
                  </td></tr>
                )}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </>
  );
}
