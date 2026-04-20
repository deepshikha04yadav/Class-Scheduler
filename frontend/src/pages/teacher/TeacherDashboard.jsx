import React, { useEffect, useState } from 'react';
import { teacherAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [timetable, setTimetable] = useState([]);

  useEffect(() => {
    teacherAPI.myProfile().then(r => {
      setProfile(r.data);
      teacherAPI.timetable(r.data.id).then(t => setTimetable(t.data));
    }).catch(() => {});
  }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayClasses = timetable.filter(e => e.day === today && !e.time_slot_detail?.is_break);

  return (
    <div className="page">
      <PageHeader title={`Welcome, ${user?.first_name}!`} subtitle="Your teaching overview" />
      <div className="stats-grid">
        <div className="stat-card stat-card-blue"><div className="stat-icon">📅</div><div className="stat-info"><div className="stat-value">{timetable.length}</div><div className="stat-label">Total Periods/Week</div></div></div>
        <div className="stat-card stat-card-green"><div className="stat-icon">📖</div><div className="stat-info"><div className="stat-value">{todayClasses.length}</div><div className="stat-label">Classes Today ({today})</div></div></div>
      </div>
      {profile && (
        <div className="info-card">
          <h3>Your Profile</h3>
          <div className="info-grid">
            <div><span>Employee ID:</span> <strong>{profile.employee_id}</strong></div>
            <div><span>Department:</span> <strong>{profile.department_name || '—'}</strong></div>
            <div><span>Subjects:</span> <strong>{profile.subjects || '—'}</strong></div>
          </div>
        </div>
      )}
      {todayClasses.length > 0 && (
        <div className="info-card">
          <h3>Today's Schedule ({today})</h3>
          <div className="today-list">
            {todayClasses.map(e => (
              <div key={e.id} className="today-item">
                <div className="today-time">{e.time_slot_detail?.start_time} – {e.time_slot_detail?.end_time}</div>
                <div className="today-subject">{e.subject_name}</div>
                <div className="today-meta">Section: {e.section} {e.room && `• Room ${e.room}`}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
