import React, { useEffect, useState } from 'react';
import { subjectAPI, departmentAPI } from '../../services/api';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import toast from 'react-hot-toast';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', department: '' });

  const load = () => {
    setLoading(true);
    Promise.all([subjectAPI.list(), departmentAPI.list()])
      .then(([s, d]) => { setSubjects(s.data); setDepartments(d.data); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await subjectAPI.update(editing.id, { ...form, department: form.department || null });
      else await subjectAPI.create({ ...form, department: form.department || null });
      toast.success('Saved'); setModal(false); load();
    } catch (err) { toast.error('Error: ' + (err.response?.data?.code?.[0] || 'saving failed')); }
  };

  const columns = [
    { key: 'name', label: 'Subject Name' },
    { key: 'code', label: 'Code' },
    { key: 'department_name', label: 'Department' },
    { key: 'actions', label: '', render: r => (
      <div className="action-btns">
        <button className="btn-sm btn-secondary" onClick={() => { setEditing(r); setForm({ name: r.name, code: r.code, department: r.department || '' }); setModal(true); }}>Edit</button>
        <button className="btn-sm btn-danger" onClick={async () => { if(window.confirm('Delete?')) { await subjectAPI.delete(r.id); toast.success('Deleted'); load(); } }}>Delete</button>
      </div>
    )},
  ];

  return (
    <div className="page">
      <PageHeader title="Subjects" subtitle={`${subjects.length} subjects`}
        action={<button className="btn-primary" onClick={() => { setEditing(null); setForm({ name:'', code:'', department:'' }); setModal(true); }}>+ Add Subject</button>} />
      <Table columns={columns} data={subjects} loading={loading} />
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Subject' : 'Add Subject'}>
        <form onSubmit={save} className="form-grid">
          <div className="form-group"><label>Subject Name</label><input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required /></div>
          <div className="form-group"><label>Code</label><input value={form.code} onChange={e=>setForm({...form, code:e.target.value})} placeholder="e.g. MATH101" required /></div>
          <div className="form-group"><label>Department</label>
            <select value={form.department} onChange={e=>setForm({...form, department:e.target.value})}>
              <option value="">— None —</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-actions"><button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
