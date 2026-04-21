import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-content">
        {/* Mobile top bar */}
        <header className="mobile-topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <span /><span /><span />
          </button>
          <div className="mobile-logo">
            <span>📅</span>
            <span>TimeTable Pro</span>
          </div>
          <button className="mobile-theme-btn" onClick={toggle} aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </header>

        <main className="app-main">
          {children}
        </main>
      </div>
    </div>
  );
}
