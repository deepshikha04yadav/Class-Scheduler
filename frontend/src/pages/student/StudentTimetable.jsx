import React, { useEffect, useState } from 'react';
import { studentAPI, timeslotAPI } from '../../services/api';
import TimetableGrid from '../../components/timetable/TimetableGrid';
import PageHeader from '../../components/common/PageHeader';

export default function StudentTimetable() {
  const [entries, setEntries] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [sectionName, setSectionName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([studentAPI.myTimetable(), timeslotAPI.list()])
      .then(([t, ts]) => {
        setEntries(t.data.entries);
        setSectionName(t.data.section);
        setTimeSlots(ts.data);
      })
      .catch(err => setError(err.response?.data?.error || 'Could not load timetable'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <PageHeader title="My Timetable" subtitle={sectionName ? `Section: ${sectionName}` : 'Your weekly class schedule'} />
      {loading ? <div className="loading-text">Loading...</div> :
        error ? <div className="empty-state">⚠️ {error}</div> :
        entries.length === 0 ? <div className="empty-state">No timetable available for your section yet.</div> :
        <TimetableGrid entries={entries} timeSlots={timeSlots} />
      }
    </div>
  );
}
