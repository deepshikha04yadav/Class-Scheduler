import React, { useEffect, useState } from 'react';
import { studentAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [timetableData, setTimetableData] = useState(null);

  useEffect(() => {
    studentAPI.myProfile().then(r => setProfile(r.data)).catch(() => {});
    studentAPI.myTimetable().then(r => setTimetableData(r.data)).catch(() => {});
  }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayClasses = timetableData?.entries?.filter(e => e.day === today && !e.time_slot_detail?.is_break) || [];

  return (
    <div className="page">
      <PageHeader title={`Hello, ${user?.first_name}!`} subtitle="Your academic schedule" />
      {profile && (
        <div className="info-card">
          <h3>My Details</h3>
          <div className="info-grid">
            <div><span>Roll Number:</span> <strong>{profile.roll_number}</strong></div>
            <div><span>Section:</span> <strong>{profile.section_name || '—'}</strong></div>
          </div>
        </div>
      )}
      {todayClasses.length > 0 && (
        <div className="info-card">
          <h3>Today's Classes ({today})</h3>
          <div className="today-list">
            {todayClasses.map(e => (
              <div key={e.id} className="today-item">
                <div className="today-time">{e.time_slot_detail?.start_time} – {e.time_slot_detail?.end_time}</div>
                <div className="today-subject">{e.subject_name}</div>
                <div className="today-meta">Teacher: {e.teacher_name || '—'} {e.room && `• Room ${e.room}`}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!profile?.section_name && (
        <div className="empty-state">⚠️ You are not assigned to a section yet. Contact your administrator.</div>
      )}
    </div>
  );
}
