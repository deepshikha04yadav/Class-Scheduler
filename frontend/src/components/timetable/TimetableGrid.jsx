import React from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SUBJECT_COLORS = [
  '#4f86c6','#e67e22','#27ae60','#8e44ad','#e74c3c',
  '#16a085','#2980b9','#d35400','#c0392b','#7d3c98',
];

function getSubjectColor(subjectId) {
  if (!subjectId) return '#94a3b8';
  return SUBJECT_COLORS[subjectId % SUBJECT_COLORS.length];
}

export default function TimetableGrid({ entries, timeSlots, days = DAYS, editable = false, onCellClick }) {
  const getEntry = (day, slotId) =>
    entries.find(e => e.day === day && (e.time_slot === slotId || e.time_slot_detail?.id === slotId));

  return (
    <div className="timetable-scroll">
      <table className="timetable-grid">
        <thead>
          <tr>
            <th className="timetable-slot-header">Time Slot</th>
            {days.map(day => <th key={day} className="timetable-day-header">{day}</th>)}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(slot => (
            <tr key={slot.id} className={slot.is_break ? 'timetable-break-row' : ''}>
              <td className="timetable-slot-cell">
                <div className="slot-name">{slot.name}</div>
                <div className="slot-time">{slot.start_time} – {slot.end_time}</div>
              </td>
              {days.map(day => {
                const entry = getEntry(day, slot.id);
                const color = entry?.subject ? getSubjectColor(entry.subject) : null;
                return (
                  <td key={day}
                    className={`timetable-cell ${slot.is_break ? 'break-cell' : ''} ${editable ? 'editable' : ''} ${entry ? 'has-entry' : ''}`}
                    onClick={() => editable && onCellClick && onCellClick(day, slot, entry)}
                  >
                    {slot.is_break ? (
                      <div className="break-label">🍽 {slot.name}</div>
                    ) : entry ? (
                      <div className="entry-card" style={{ borderLeftColor: color }}>
                        <div className="entry-subject">{entry.subject_name || 'Subject'}</div>
                        <div className="entry-teacher">👤 {entry.teacher_name || '—'}</div>
                        {entry.room && <div className="entry-room">🚪 {entry.room}</div>}
                      </div>
                    ) : editable ? (
                      <div className="empty-cell-hint">+ Add</div>
                    ) : (
                      <div className="empty-cell">—</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
