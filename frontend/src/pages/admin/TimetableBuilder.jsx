import React, { useEffect, useState } from 'react';
import { classAPI, sectionAPI, timeslotAPI, subjectAPI, teacherAPI, timetableAPI } from '../../services/api';
import TimetableGrid from '../../components/timetable/TimetableGrid';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetableBuilder() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [cellModal, setCellModal] = useState(false);
  const [cellData, setCellData] = useState({ day: '', slot: null, entry: null });
  const [cellForm, setCellForm] = useState({ subject: '', teacher: '', room: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([classAPI.list(), timeslotAPI.list(), subjectAPI.list(), teacherAPI.list()])
      .then(([c, ts, s, t]) => { setClasses(c.data); setTimeSlots(ts.data); setSubjects(s.data); setTeachers(t.data); });
  }, []);

  useEffect(() => {
    if (selectedClass) sectionAPI.list(selectedClass).then(r => setSections(r.data));
    else setSections([]);
    setSelectedSection('');
    setEntries([]);
  }, [selectedClass]);

  useEffect(() => {
    if (selectedSection) sectionAPI.timetable(selectedSection).then(r => setEntries(r.data));
    else setEntries([]);
  }, [selectedSection]);

  const handleCellClick = (day, slot, entry) => {
    if (slot.is_break) return;
    setCellData({ day, slot, entry });
    setCellForm({ subject: entry?.subject || '', teacher: entry?.teacher || '', room: entry?.room || '' });
    setCellModal(true);
  };

  const handleSaveCell = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { section: selectedSection, day: cellData.day, time_slot: cellData.slot.id, subject: cellForm.subject || null, teacher: cellForm.teacher || null, room: cellForm.room };
      if (cellData.entry) {
        await timetableAPI.update(cellData.entry.id, payload);
      } else {
        await timetableAPI.create(payload);
      }
      const r = await sectionAPI.timetable(selectedSection);
      setEntries(r.data);
      setCellModal(false);
      toast.success('Saved');
    } catch (err) {
      toast.error(err.response?.data ? JSON.stringify(err.response.data) : 'Error saving');
    } finally { setSaving(false); }
  };

  const handleDeleteCell = async () => {
    if (!cellData.entry) return;
    await timetableAPI.delete(cellData.entry.id);
    const r = await sectionAPI.timetable(selectedSection);
    setEntries(r.data);
    setCellModal(false);
    toast.success('Entry removed');
  };

  return (
    <div className="page">
      <PageHeader title="Timetable Builder" subtitle="Create and manage timetables for each section" />
      <div className="builder-filters">
        <div className="form-group">
          <label>Select Class</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            <option value="">— Choose Class —</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Select Section</label>
          <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={!selectedClass}>
            <option value="">— Choose Section —</option>
            {sections.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
          </select>
        </div>
      </div>

      {selectedSection ? (
        timeSlots.length === 0 ? (
          <div className="empty-state">⚠️ No time slots defined. Please add time slots first.</div>
        ) : (
          <TimetableGrid entries={entries} timeSlots={timeSlots} days={DAYS} editable={true} onCellClick={handleCellClick} />
        )
      ) : (
        <div className="empty-state">👆 Select a class and section to start building the timetable</div>
      )}

      <Modal open={cellModal} onClose={() => setCellModal(false)} title={`${cellData.day} — ${cellData.slot?.name}`}>
        <form onSubmit={handleSaveCell} className="form-grid">
          <div className="form-group"><label>Subject</label>
            <select value={cellForm.subject} onChange={e=>setCellForm({...cellForm, subject:e.target.value})}>
              <option value="">— Free Period —</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>
          <div className="form-group"><label>Teacher</label>
            <select value={cellForm.teacher} onChange={e=>setCellForm({...cellForm, teacher:e.target.value})}>
              <option value="">— Unassigned —</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.user.first_name} {t.user.last_name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Room</label><input value={cellForm.room} onChange={e=>setCellForm({...cellForm, room:e.target.value})} placeholder="e.g. Room 101" /></div>
          <div className="form-actions">
            {cellData.entry && <button type="button" className="btn-danger" onClick={handleDeleteCell}>Remove</button>}
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
