import React from 'react';
import TaskItem from './TaskItem';
import '../../styles/day-tasks-modal.css';

const DayTasksModal = ({ isOpen, onClose, date, tasks, categories, onTaskToggle, onTaskDelete, onTaskEdit, onAddTask }) => {
  if (!isOpen) return null;

  const formattedDate = date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="day-tasks-modal-overlay" onClick={onClose}>
      <div className="day-tasks-modal" onClick={e => e.stopPropagation()}>
        <div className="day-tasks-modal-header">
          <h2>{formattedDate}</h2>
          <button className="day-tasks-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="day-tasks-modal-content">
          <button 
            className="day-tasks-modal-add-btn"
            onClick={() => onAddTask(date)}
          >
            + Добавить задачу
          </button>
          {tasks.length > 0 ? (
            tasks.map(task => (
              <TaskItem
                key={task._id}
                task={task}
                category={categories.find(c => c._id === task.categories_id)}
                onToggle={() => onTaskToggle(task._id)}
                onDelete={() => onTaskDelete(task._id)}
                onEdit={() => onTaskEdit(task)}
              />
            ))
          ) : (
            <p className="day-tasks-modal-empty">Нет задач на этот день</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayTasksModal; 