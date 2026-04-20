import React, { useEffect, useState } from 'react';
import { teacherAPI, sectionAPI, timeslotAPI } from '../../services/api';
import TimetableGrid from '../../components/timetable/TimetableGrid';
import PageHeader from '../../components/common/PageHeader';

export default function TeacherClasses() {
  const [sections, setSections] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selected, setSelected] = useState('');
  const [entries, setEntries] = useState([]);
  const [teacherId, setTeacherId] = useState(null);

  useEffect(() => {
    Promise.all([teacherAPI.myProfile(), timeslotAPI.list(), sectionAPI.list()])
      .then(([p, ts, sec]) => { setTeacherId(p.data.id); setTimeSlots(ts.data); setSections(sec.data); });
  }, []);

  useEffect(() => {
    if (selected) sectionAPI.timetable(selected).then(r => setEntries(r.data));
  }, [selected]);

  return (
    <div className="page">
      <PageHeader title="Section Timetables" subtitle="View timetables for any section" />
      <div className="builder-filters">
        <div className="form-group">
          <label>Select Section</label>
          <select value={selected} onChange={e => setSelected(e.target.value)}>
            <option value="">— Choose Section —</option>
            {sections.map(s => <option key={s.id} value={s.id}>{s.classroom_name} - Sec {s.name}</option>)}
          </select>
        </div>
      </div>
      {selected ? (
        <TimetableGrid entries={entries} timeSlots={timeSlots} />
      ) : (
        <div className="empty-state">Select a section to view its timetable</div>
      )}
    </div>
  );
}
