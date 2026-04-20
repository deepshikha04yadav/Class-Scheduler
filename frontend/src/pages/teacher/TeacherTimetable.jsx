import React, { useEffect, useState } from 'react';
import { teacherAPI, timeslotAPI } from '../../services/api';
import TimetableGrid from '../../components/timetable/TimetableGrid';
import PageHeader from '../../components/common/PageHeader';

export default function TeacherTimetable() {
  const [entries, setEntries] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([teacherAPI.myProfile(), timeslotAPI.list()])
      .then(([p, ts]) => {
        setTimeSlots(ts.data);
        return teacherAPI.timetable(p.data.id);
      })
      .then(r => setEntries(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <PageHeader title="My Timetable" subtitle="Your weekly teaching schedule" />
      {loading ? <div className="loading-text">Loading...</div> : (
        timeSlots.length === 0 ? <div className="empty-state">No time slots configured yet.</div> :
        entries.length === 0 ? <div className="empty-state">No timetable entries assigned to you yet.</div> :
        <TimetableGrid entries={entries} timeSlots={timeSlots} />
      )}
    </div>
  );
}
