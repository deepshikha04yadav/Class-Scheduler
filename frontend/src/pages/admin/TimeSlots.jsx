import React, { useEffect, useState } from 'react';
import { timeslotAPI } from '../../services/api';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import toast from 'react-hot-toast';

export default function TimeSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', start_time: '', end_time: '', is_break: false, order: 0 });

  const load = () => { setLoading(true); timeslotAPI.list().then(r => setSlots(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await timeslotAPI.update(editing.id, form);
      else await timeslotAPI.create(form);
      toast.success('Saved'); setModal(false); load();
    } catch { toast.error('Error saving'); }
  };

  const columns = [
    { key: 'order', label: '#' },
    { key: 'name', label: 'Period Name' },
    { key: 'start_time', label: 'Start Time' },
    { key: 'end_time', label: 'End Time' },
    { key: 'is_break', label: 'Break?', render: r => r.is_break ? '✅ Break' : '📖 Period' },
    { key: 'actions', label: '', render: r => (
      <div className="action-btns">
        <button className="btn-sm btn-secondary" onClick={() => { setEditing(r); setForm({ name: r.name, start_time: r.start_time, end_time: r.end_time, is_break: r.is_break, order: r.order }); setModal(true); }}>Edit</button>
        <button className="btn-sm btn-danger" onClick={async () => { if(window.confirm('Delete?')) { await timeslotAPI.delete(r.id); toast.success('Deleted'); load(); } }}>Delete</button>
      </div>
    )},
  ];

  return (
    <div className="page">
      <PageHeader title="Time Slots" subtitle="Define periods and breaks for the school day"
        action={<button className="btn-primary" onClick={() => { setEditing(null); setForm({ name:'', start_time:'', end_time:'', is_break: false, order: slots.length }); setModal(true); }}>+ Add Slot</button>} />
      <Table columns={columns} data={slots} loading={loading} />
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Time Slot' : 'Add Time Slot'}>
        <form onSubmit={save} className="form-grid">
          <div className="form-group"><label>Period Name</label><input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="e.g. Period 1, Lunch Break" required /></div>
          <div className="form-group"><label>Start Time</label><input type="time" value={form.start_time} onChange={e=>setForm({...form, start_time:e.target.value})} required /></div>
          <div className="form-group"><label>End Time</label><input type="time" value={form.end_time} onChange={e=>setForm({...form, end_time:e.target.value})} required /></div>
          <div className="form-group"><label>Display Order</label><input type="number" value={form.order} onChange={e=>setForm({...form, order:parseInt(e.target.value)})} /></div>
          <div className="form-group form-check">
            <label><input type="checkbox" checked={form.is_break} onChange={e=>setForm({...form, is_break:e.target.checked})} /> This is a break/free period</label>
          </div>
          <div className="form-actions"><button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
