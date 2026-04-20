import React, { useEffect, useState } from 'react';
import { teacherAPI, userAPI, departmentAPI } from '../../services/api';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import toast from 'react-hot-toast';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ first_name:'', last_name:'', email:'', password:'', employee_id:'', department:'', subjects:'', phone:'' });

  const load = () => {
    setLoading(true);
    Promise.all([teacherAPI.list(), departmentAPI.list()])
      .then(([t, d]) => { setTeachers(t.data); setDepartments(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ first_name:'', last_name:'', email:'', password:'', employee_id:'', department:'', subjects:'', phone:'' }); setModal(true); };
  const openEdit = (t) => { setEditing(t); setForm({ first_name: t.user.first_name, last_name: t.user.last_name, email: t.user.email, password:'', employee_id: t.employee_id, department: t.department || '', subjects: t.subjects, phone: t.phone }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await userAPI.update(editing.user.id, { first_name: form.first_name, last_name: form.last_name });
        await teacherAPI.update(editing.id, { employee_id: form.employee_id, department: form.department || null, subjects: form.subjects, phone: form.phone });
        toast.success('Teacher updated');
      } else {
        const userRes = await userAPI.create({ ...form, role: 'teacher' });
        await teacherAPI.create({ user_id: userRes.data.id, employee_id: form.employee_id, department: form.department || null, subjects: form.subjects, phone: form.phone });
        toast.success('Teacher created');
      }
      setModal(false); load();
    } catch (err) {
      toast.error(err.response?.data ? JSON.stringify(err.response.data) : 'Error saving');
    }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete teacher ${t.user.first_name}?`)) return;
    await teacherAPI.delete(t.id);
    await userAPI.delete(t.user.id);
    toast.success('Deleted'); load();
  };

  const columns = [
    { key: 'name', label: 'Name', render: r => r.user.first_name + ' ' + r.user.last_name },
    { key: 'email', label: 'Email', render: r => r.user.email },
    { key: 'employee_id', label: 'Employee ID' },
    { key: 'department_name', label: 'Department' },
    { key: 'subjects', label: 'Subjects' },
    { key: 'actions', label: 'Actions', render: r => (
      <div className="action-btns">
        <button className="btn-sm btn-secondary" onClick={() => openEdit(r)}>Edit</button>
        <button className="btn-sm btn-danger" onClick={() => handleDelete(r)}>Delete</button>
      </div>
    )},
  ];

  return (
    <div className="page">
      <PageHeader title="Teachers" subtitle={`${teachers.length} teachers registered`}
        action={<button className="btn-primary" onClick={openAdd}>+ Add Teacher</button>} />
      <Table columns={columns} data={teachers} loading={loading} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Teacher' : 'Add Teacher'}>
        <form onSubmit={handleSubmit} className="form-grid">
          {!editing && <>
            <div className="form-group"><label>First Name</label><input value={form.first_name} onChange={e=>setForm({...form, first_name:e.target.value})} required /></div>
            <div className="form-group"><label>Last Name</label><input value={form.last_name} onChange={e=>setForm({...form, last_name:e.target.value})} required /></div>
            <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required /></div>
            <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required /></div>
          </>}
          {editing && <>
            <div className="form-group"><label>First Name</label><input value={form.first_name} onChange={e=>setForm({...form, first_name:e.target.value})} required /></div>
            <div className="form-group"><label>Last Name</label><input value={form.last_name} onChange={e=>setForm({...form, last_name:e.target.value})} required /></div>
          </>}
          <div className="form-group"><label>Employee ID</label><input value={form.employee_id} onChange={e=>setForm({...form, employee_id:e.target.value})} required /></div>
          <div className="form-group"><label>Department</label>
            <select value={form.department} onChange={e=>setForm({...form, department:e.target.value})}>
              <option value="">— None —</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Subjects (comma-separated)</label><input value={form.subjects} onChange={e=>setForm({...form, subjects:e.target.value})} /></div>
          <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} /></div>
          <div className="form-actions"><button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
