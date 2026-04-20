import React, { useEffect, useState } from 'react';
import { studentAPI, sectionAPI, userAPI } from '../../services/api';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import toast from 'react-hot-toast';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ first_name:'', last_name:'', email:'', password:'', roll_number:'', section:'', phone:'' });

  const load = () => {
    setLoading(true);
    Promise.all([studentAPI.list(), sectionAPI.list()])
      .then(([s, sec]) => { setStudents(s.data); setSections(sec.data); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ first_name:'', last_name:'', email:'', password:'', roll_number:'', section:'', phone:'' }); setModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ first_name: s.user.first_name, last_name: s.user.last_name, email: s.user.email, password:'', roll_number: s.roll_number, section: s.section || '', phone: s.phone }); setModal(true); };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await userAPI.update(editing.user.id, { first_name: form.first_name, last_name: form.last_name });
        await studentAPI.update(editing.id, { roll_number: form.roll_number, section: form.section || null, phone: form.phone });
        toast.success('Updated');
      } else {
        const userRes = await userAPI.create({ first_name: form.first_name, last_name: form.last_name, email: form.email, password: form.password, role: 'student' });
        await studentAPI.create({ user_id: userRes.data.id, roll_number: form.roll_number, section: form.section || null, phone: form.phone });
        toast.success('Student created');
      }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data ? JSON.stringify(err.response.data) : 'Error'); }
  };

  const handleDelete = async (s) => {
    if (!window.confirm('Delete student?')) return;
    await studentAPI.delete(s.id);
    await userAPI.delete(s.user.id);
    toast.success('Deleted'); load();
  };

  const columns = [
    { key: 'name', label: 'Name', render: r => r.user.first_name + ' ' + r.user.last_name },
    { key: 'email', label: 'Email', render: r => r.user.email },
    { key: 'roll_number', label: 'Roll No.' },
    { key: 'section_name', label: 'Section' },
    { key: 'actions', label: '', render: r => (
      <div className="action-btns">
        <button className="btn-sm btn-secondary" onClick={() => openEdit(r)}>Edit</button>
        <button className="btn-sm btn-danger" onClick={() => handleDelete(r)}>Delete</button>
      </div>
    )},
  ];

  return (
    <div className="page">
      <PageHeader title="Students" subtitle={`${students.length} students enrolled`}
        action={<button className="btn-primary" onClick={openAdd}>+ Add Student</button>} />
      <Table columns={columns} data={students} loading={loading} />
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Student' : 'Add Student'}>
        <form onSubmit={save} className="form-grid">
          <div className="form-group"><label>First Name</label><input value={form.first_name} onChange={e=>setForm({...form, first_name:e.target.value})} required /></div>
          <div className="form-group"><label>Last Name</label><input value={form.last_name} onChange={e=>setForm({...form, last_name:e.target.value})} required /></div>
          {!editing && <>
            <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required /></div>
            <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required /></div>
          </>}
          <div className="form-group"><label>Roll Number</label><input value={form.roll_number} onChange={e=>setForm({...form, roll_number:e.target.value})} required /></div>
          <div className="form-group"><label>Section</label>
            <select value={form.section} onChange={e=>setForm({...form, section:e.target.value})}>
              <option value="">— Unassigned —</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.classroom_name} - Sec {s.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} /></div>
          <div className="form-actions"><button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
