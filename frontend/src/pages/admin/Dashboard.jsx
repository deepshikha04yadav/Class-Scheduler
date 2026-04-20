import React, { useEffect, useState } from 'react';
import { userAPI } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    userAPI.stats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div className="page">
      <PageHeader title="Admin Dashboard" subtitle="Overview of your institution" />
      <div className="stats-grid">
        <StatCard icon="👩‍🏫" label="Teachers" value={stats?.teachers ?? '—'} color="blue" />
        <StatCard icon="👨‍🎓" label="Students" value={stats?.students ?? '—'} color="green" />
        <StatCard icon="🏫" label="Classes" value={stats?.classes ?? '—'} color="purple" />
        <StatCard icon="📋" label="Sections" value={stats?.sections ?? '—'} color="orange" />
        <StatCard icon="📚" label="Subjects" value={stats?.subjects ?? '—'} color="red" />
        <StatCard icon="📅" label="Timetable Entries" value={stats?.timetable_entries ?? '—'} color="teal" />
      </div>
      <div className="dashboard-hints">
        <h3>Quick Start Guide</h3>
        <ol>
          <li>Add <strong>Departments</strong> and <strong>Subjects</strong></li>
          <li>Create <strong>Teachers</strong> with user accounts</li>
          <li>Set up <strong>Classes & Sections</strong></li>
          <li>Define <strong>Time Slots</strong> (periods + breaks)</li>
          <li>Build the <strong>Timetable</strong> for each section</li>
          <li>Add <strong>Students</strong> and assign them to sections</li>
        </ol>
      </div>
    </div>
  );
}
