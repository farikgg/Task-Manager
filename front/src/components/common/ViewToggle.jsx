import React from 'react';
import '../../styles/view-toggle.css';
import { FaCalendarAlt, FaList } from 'react-icons/fa';

const ViewToggle = ({ view, onViewChange }) => {
  return (
    <div className="view-toggle">
      <button
        onClick={() => onViewChange('calendar')}
        className={`view-toggle-button ${view === 'calendar' ? 'active' : ''}`}
      >
        <FaCalendarAlt style={{ marginRight: 6, verticalAlign: 'middle' }} /> Календарь
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`view-toggle-button ${view === 'list' ? 'active' : ''}`}
      >
        <FaList style={{ marginRight: 6, verticalAlign: 'middle' }} /> Список
      </button>
    </div>
  );
};

export default ViewToggle; 