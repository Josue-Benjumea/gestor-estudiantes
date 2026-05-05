import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Users as UsersIcon, Search, FileDown } from 'lucide-react';
import { usersApi, groupsApi, settingsApi } from '../api';
import { useToastStore } from '../store/toastStore';
import Topbar from '../components/layout/Topbar';
import Modal from '../components/ui/Modal';
import { jsPDF } from 'jspdf';
import appLogo from '../assets/Logo.png';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', role: 'student' });
  const [assignGroupId, setAssignGroupId] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(null);
  const { addToast } = useToastStore();

  const load = async () => {
    try {
      const [sRes, gRes] = await Promise.all([usersApi.getStudents(), groupsApi.getAll()]);
      setStudents(sRes.data.data);
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
        addToast('Estudiante actualizado', 'success');
      } else {
        await usersApi.create(form);
        addToast('Estudiante creado exitosamente', 'success');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ first_name: '', last_name: '', email: '', password: '', role: 'student' });
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  const handleEdit = (student) => {
    setEditing(student);
    setForm({ first_name: student.first_name, last_name: student.last_name, email: student.email, password: '', role: 'student' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este estudiante?')) return;
    try {
      await usersApi.delete(id);
      addToast('Estudiante eliminado', 'success');
      load();
    } catch {
      addToast('Error al eliminar', 'error');
    }
  };

  const handleAssign = async () => {
    if (!assignGroupId) return;
    try {
      await usersApi.assignGroup(assignTarget.id, { group_id: parseInt(assignGroupId) });
      addToast('Grupo asignado exitosamente', 'success');
      setShowAssignModal(false);
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  const openAssign = (student) => {
    setAssignTarget(student);
    setAssignGroupId(student.group_id?.toString() || '');
    setShowAssignModal(true);
  };

  // ─── Generate Certificate PDF ─────────────────────────────
  const generateCertificate = async (studentId) => {
    setGeneratingPdf(studentId);
    try {
      const res = await settingsApi.getCertificateData(studentId);
      const { student, institution, period, subjects, generated_at } = res.data.data;

      const doc = new jsPDF('p', 'mm', 'letter');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 25;
      const contentWidth = pageWidth - margin * 2;
      let y = 30;

      // ─── Decorative top border ───
      doc.setFillColor(103, 126, 234);
      doc.rect(0, 0, pageWidth, 8, 'F');
      doc.setFillColor(118, 75, 162);
      doc.rect(0, 8, pageWidth, 3, 'F');

      y = 20;

      // ─── Institution Logo + Name (header) ───
      let logoLoaded = false;
      if (institution.logo) {
        try {
          doc.addImage(institution.logo, 'PNG', margin, y, 20, 20);
          logoLoaded = true;
        } catch {
          // Logo couldn't load, skip
        }
      }

      const headerX = logoLoaded ? margin + 26 : pageWidth / 2;
      const headerAlign = logoLoaded ? 'left' : 'center';

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 80);
      doc.text(institution.name, headerX, y + 8, { align: headerAlign });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 120);
      doc.text('NIT: 000.000.000-0 · Resolución de Aprobación No. 0000', headerX, y + 15, { align: headerAlign });

      y = logoLoaded ? y + 30 : y + 24;

      // ─── Separator ───
      doc.setDrawColor(103, 126, 234);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 12;

      // ─── Certificate Title ───
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(103, 126, 234);
      doc.text('CERTIFICADO DE MATRÍCULA', pageWidth / 2, y, { align: 'center' });
      y += 10;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 120);
      doc.text(`Periodo Académico: ${period?.name || 'N/A'}`, pageWidth / 2, y, { align: 'center' });
      y += 16;

      // ─── Body Text ───
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);

      const bodyText = `La ${institution.name} certifica que el/la estudiante:`;
      doc.text(bodyText, pageWidth / 2, y, { align: 'center' });
      y += 14;

      // ─── Student Name (large) ───
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 80);
      doc.text(`${student.first_name} ${student.last_name}`, pageWidth / 2, y, { align: 'center' });
      y += 12;

      // ─── Student Info Box ───
      doc.setFillColor(245, 245, 250);
      doc.roundedRect(margin, y, contentWidth, 36, 3, 3, 'F');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 120);

      const col1x = margin + 8;
      const col2x = margin + contentWidth / 2 + 8;

      doc.text('CORREO ELECTRÓNICO', col1x, y + 9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.text(student.email, col1x, y + 16);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 120);
      doc.text('GRUPO', col2x, y + 9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.text(student.group_name || 'Sin asignar', col2x, y + 16);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 120);
      doc.text('FECHA DE MATRÍCULA', col1x, y + 26);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.text(new Date(student.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }), col1x, y + 33);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 120);
      doc.text('ESTADO', col2x, y + 26);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.text('Matriculado', col2x, y + 33);

      y += 46;

      // ─── Subjects Table (if available) ───
      if (subjects.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 80);
        doc.text('Materias Inscritas', margin, y);
        y += 8;

        // Table header
        doc.setFillColor(103, 126, 234);
        doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('MATERIA', margin + 6, y + 5.5);
        doc.text('PROMEDIO', margin + contentWidth - 40, y + 5.5);
        doc.text('ACTIVIDADES', margin + contentWidth - 80, y + 5.5);
        y += 10;

        // Table rows
        subjects.forEach((s, i) => {
          if (i % 2 === 0) {
            doc.setFillColor(248, 248, 252);
            doc.rect(margin, y - 1, contentWidth, 8, 'F');
          }
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(40, 40, 40);
          doc.text(s.subject_name, margin + 6, y + 4.5);

          doc.setFont('helvetica', 'bold');
          const avgColor = s.average >= 70 ? [52, 199, 89] : s.average >= 60 ? [255, 159, 10] : [255, 59, 48];
          doc.setTextColor(...avgColor);
          doc.text(s.average.toString(), margin + contentWidth - 35, y + 4.5);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 120);
          doc.text(s.activity_count.toString(), margin + contentWidth - 68, y + 4.5);

          y += 8;
        });

        y += 6;
      }

      // ─── Certification statement ───
      y += 4;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const certText = `Se expide el presente certificado a solicitud del interesado, en la ciudad el día ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}.`;
      const splitText = doc.splitTextToSize(certText, contentWidth);
      doc.text(splitText, margin, y);
      y += splitText.length * 6 + 30;

      // ─── Signature line ───
      doc.setDrawColor(40, 40, 80);
      doc.setLineWidth(0.3);
      doc.line(margin + 20, y, margin + 90, y);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 80);
      doc.text('Rector(a)', margin + 55, y + 6, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 120);
      doc.text(institution.name, margin + 55, y + 12, { align: 'center' });

      // ─── Footer ───
      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setFillColor(245, 245, 250);
      doc.rect(0, footerY - 5, pageWidth, 20, 'F');
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 160);
      doc.text(`Documento generado el ${new Date(generated_at).toLocaleString('es-CO')} · EduManager`, pageWidth / 2, footerY + 2, { align: 'center' });
      doc.text(`ID Estudiante: ${student.id}`, pageWidth / 2, footerY + 7, { align: 'center' });

      // ─── Bottom decorative border ───
      doc.setFillColor(118, 75, 162);
      doc.rect(0, doc.internal.pageSize.getHeight() - 3, pageWidth, 3, 'F');

      // Save
      doc.save(`Certificado_${student.first_name}_${student.last_name}.pdf`);
      addToast(`Certificado generado para ${student.first_name} ${student.last_name}`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Error al generar certificado', 'error');
    } finally {
      setGeneratingPdf(null);
    }
  };

  const filtered = students.filter((s) =>
    `${s.first_name} ${s.last_name} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Topbar title="Estudiantes" />
      <div className="page-container">
        <div className="flex-between page-header">
          <div>
            <h1 className="page-title">Estudiantes</h1>
            <p className="page-subtitle">{students.length} estudiantes registrados</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ first_name: '', last_name: '', email: '', password: '', role: 'student' }); setShowModal(true); }}>
            <Plus size={18} /> Nuevo Estudiante
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 24, position: 'relative', maxWidth: 400 }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="form-input" placeholder="Buscar estudiantes..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
        </div>

        {loading ? (
          <div className="loader-container"><div className="spinner" /></div>
        ) : (
          <motion.div className="glass-card table-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <table>
              <thead>
                <tr><th>Nombre</th><th>Email</th><th>Grupo</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.first_name} {s.last_name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                    <td>
                      <button className={`badge ${s.group_name ? 'badge-blue' : 'badge-gray'}`} onClick={() => openAssign(s)} style={{ cursor: 'pointer', border: 'none' }}>
                        {s.group_name || 'Sin asignar'}
                      </button>
                    </td>
                    <td><span className={`badge ${s.is_active ? 'badge-green' : 'badge-red'}`}>{s.is_active ? 'Activo' : 'Inactivo'}</span></td>
                    <td>
                      <div className="flex-gap">
                        <button
                          className="btn-ghost btn-icon"
                          onClick={() => generateCertificate(s.id)}
                          title="Descargar Certificado"
                          disabled={generatingPdf === s.id}
                          style={{ color: 'var(--info)' }}
                        >
                          <FileDown size={16} />
                        </button>
                        <button className="btn-ghost btn-icon" onClick={() => handleEdit(s)} title="Editar"><Edit2 size={16} /></button>
                        <button className="btn-ghost btn-icon" onClick={() => handleDelete(s.id)} title="Eliminar" style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>No se encontraron estudiantes</td></tr>
                )}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Estudiante' : 'Nuevo Estudiante'}
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

      {/* Assign Group Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Asignar Grupo" size="sm"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleAssign}>Asignar</button>
        </>}
      >
        <p style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Asignar a <strong>{assignTarget?.first_name} {assignTarget?.last_name}</strong> a un grupo:
        </p>
        <div className="form-group">
          <label className="form-label">Grupo</label>
          <select className="form-input" value={assignGroupId} onChange={(e) => setAssignGroupId(e.target.value)}>
            <option value="">Seleccionar grupo...</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name} — {g.description}</option>)}
          </select>
        </div>
      </Modal>
    </>
  );
}
