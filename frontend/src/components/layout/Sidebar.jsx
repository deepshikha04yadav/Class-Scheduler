import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/admin/teachers', label: 'Teachers', icon: '👩‍🏫' },
  { to: '/admin/classes', label: 'Classes & Sections', icon: '🏫' },
  { to: '/admin/subjects', label: 'Subjects', icon: '📚' },
  { to: '/admin/timeslots', label: 'Time Slots', icon: '⏰' },
  { to: '/admin/timetable', label: 'Timetable Builder', icon: '📅' },
  { to: '/admin/students', label: 'Students', icon: '👨‍🎓' },
];
const teacherLinks = [
  { to: '/teacher', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/teacher/timetable', label: 'My Timetable', icon: '📅' },
  { to: '/teacher/classes', label: 'My Classes', icon: '🏫' },
];
const studentLinks = [
  { to: '/student', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/student/timetable', label: 'My Timetable', icon: '📅' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const links = user?.role === 'admin' ? adminLinks : user?.role === 'teacher' ? teacherLinks : studentLinks;

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">📅</span>
          <div style={{ flex: 1 }}>
            <div className="sidebar-logo-title">TimeTable Pro</div>
            <div className="sidebar-logo-sub">{user?.role?.toUpperCase()}</div>
          </div>
          {/* Mobile close button */}
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">✕</button>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.first_name?.[0]}{user?.last_name?.[0]}</div>
          <div style={{ minWidth: 0 }}>
            <div className="sidebar-username">{user?.first_name} {user?.last_name}</div>
            <div className="sidebar-email">{user?.email}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={handleNavClick}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-link-icon">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* Dark mode toggle */}
          <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
            <span>{theme === 'light' ? '🌙' : '☀️'}</span>
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          <button className="sidebar-logout" onClick={handleLogout}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
