import React, { useEffect, useState } from 'react';
import { classAPI, sectionAPI, teacherAPI, departmentAPI } from '../../services/api';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import toast from 'react-hot-toast';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('classes');
  const [classModal, setClassModal] = useState(false);
  const [sectionModal, setSectionModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [classForm, setClassForm] = useState({ name: '', grade: '', department: '' });
  const [sectionForm, setSectionForm] = useState({ name: '', classroom: '', class_teacher: '', max_students: 40 });

  const load = () => {
    setLoading(true);
    Promise.all([classAPI.list(), sectionAPI.list(), teacherAPI.list(), departmentAPI.list()])
      .then(([c, s, t, d]) => { setClasses(c.data); setSections(s.data); setTeachers(t.data); setDepartments(d.data); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const classColumns = [
    { key: 'name', label: 'Class Name' },
    { key: 'grade', label: 'Grade' },
    { key: 'department_name', label: 'Department' },
    { key: 'section_count', label: 'Sections' },
    { key: 'actions', label: '', render: r => (
      <div className="action-btns">
        <button className="btn-sm btn-secondary" onClick={() => { setEditingClass(r); setClassForm({ name: r.name, grade: r.grade, department: r.department || '' }); setClassModal(true); }}>Edit</button>
        <button className="btn-sm btn-danger" onClick={async () => { if(window.confirm('Delete class?')) { await classAPI.delete(r.id); toast.success('Deleted'); load(); } }}>Delete</button>
      </div>
    )},
  ];

  const sectionColumns = [
    { key: 'classroom_name', label: 'Class' },
    { key: 'name', label: 'Section' },
    { key: 'class_teacher_name', label: 'Class Teacher' },
    { key: 'student_count', label: 'Students' },
    { key: 'max_students', label: 'Max' },
    { key: 'actions', label: '', render: r => (
      <div className="action-btns">
        <button className="btn-sm btn-secondary" onClick={() => { setEditingSection(r); setSectionForm({ name: r.name, classroom: r.classroom, class_teacher: r.class_teacher || '', max_students: r.max_students }); setSectionModal(true); }}>Edit</button>
        <button className="btn-sm btn-danger" onClick={async () => { if(window.confirm('Delete section?')) { await sectionAPI.delete(r.id); toast.success('Deleted'); load(); } }}>Delete</button>
      </div>
    )},
  ];

  const saveClass = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) await classAPI.update(editingClass.id, { ...classForm, department: classForm.department || null });
      else await classAPI.create({ ...classForm, department: classForm.department || null });
      toast.success('Saved'); setClassModal(false); load();
    } catch (err) { toast.error('Error saving'); }
  };

  const saveSection = async (e) => {
    e.preventDefault();
    try {
      if (editingSection) await sectionAPI.update(editingSection.id, { ...sectionForm, class_teacher: sectionForm.class_teacher || null });
      else await sectionAPI.create({ ...sectionForm, class_teacher: sectionForm.class_teacher || null });
      toast.success('Saved'); setSectionModal(false); load();
    } catch (err) { toast.error('Error saving'); }
  };

  return (
    <div className="page">
      <PageHeader title="Classes & Sections" subtitle="Manage academic classes and their sections" />
      <div className="tab-bar">
        <button className={`tab-btn ${tab==='classes'?'active':''}`} onClick={() => setTab('classes')}>Classes ({classes.length})</button>
        <button className={`tab-btn ${tab==='sections'?'active':''}`} onClick={() => setTab('sections')}>Sections ({sections.length})</button>
      </div>
      {tab === 'classes' && <>
        <div className="section-action"><button className="btn-primary" onClick={() => { setEditingClass(null); setClassForm({ name:'', grade:'', department:'' }); setClassModal(true); }}>+ Add Class</button></div>
        <Table columns={classColumns} data={classes} loading={loading} />
      </>}
      {tab === 'sections' && <>
        <div className="section-action"><button className="btn-primary" onClick={() => { setEditingSection(null); setSectionForm({ name:'', classroom:'', class_teacher:'', max_students:40 }); setSectionModal(true); }}>+ Add Section</button></div>
        <Table columns={sectionColumns} data={sections} loading={loading} />
      </>}

      <Modal open={classModal} onClose={() => setClassModal(false)} title={editingClass ? 'Edit Class' : 'Add Class'}>
        <form onSubmit={saveClass} className="form-grid">
          <div className="form-group"><label>Class Name</label><input value={classForm.name} onChange={e=>setClassForm({...classForm, name:e.target.value})} placeholder="e.g. Class 10, Year 2" required /></div>
          <div className="form-group"><label>Grade / Year</label><input type="number" value={classForm.grade} onChange={e=>setClassForm({...classForm, grade:e.target.value})} required /></div>
          <div className="form-group"><label>Department</label>
            <select value={classForm.department} onChange={e=>setClassForm({...classForm, department:e.target.value})}>
              <option value="">— None —</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-actions"><button type="submit" className="btn-primary">{editingClass ? 'Update' : 'Create'}</button></div>
        </form>
      </Modal>

      <Modal open={sectionModal} onClose={() => setSectionModal(false)} title={editingSection ? 'Edit Section' : 'Add Section'}>
        <form onSubmit={saveSection} className="form-grid">
          <div className="form-group"><label>Class</label>
            <select value={sectionForm.classroom} onChange={e=>setSectionForm({...sectionForm, classroom:e.target.value})} required>
              <option value="">— Select Class —</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Section Name</label><input value={sectionForm.name} onChange={e=>setSectionForm({...sectionForm, name:e.target.value})} placeholder="e.g. A, B, C" required /></div>
          <div className="form-group"><label>Class Teacher</label>
            <select value={sectionForm.class_teacher} onChange={e=>setSectionForm({...sectionForm, class_teacher:e.target.value})}>
              <option value="">— None —</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.user.first_name} {t.user.last_name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Max Students</label><input type="number" value={sectionForm.max_students} onChange={e=>setSectionForm({...sectionForm, max_students:e.target.value})} /></div>
          <div className="form-actions"><button type="submit" className="btn-primary">{editingSection ? 'Update' : 'Create'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
