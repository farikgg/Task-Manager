import React from 'react';
import '../../styles/tasklist.css';
import { MdDelete } from 'react-icons/md';
import { CiEdit } from 'react-icons/ci';

const TaskItem = ({ task, category, onToggle, onDelete, onEdit }) => {
  return (
    <div className="task-item" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <input
        type="checkbox"
        checked={task.isCompleted}
        onChange={() => onToggle(task._id)}
        className="task-item-checkbox"
        style={{ marginRight: 4 }}
        aria-label={task.isCompleted ? 'Снять отметку' : 'Отметить как выполнено'}
      />
      <div className="task-item-content" style={{ flex: 1 }}>
        <div className={`task-item-title ${task.isCompleted ? 'task-item-completed' : ''}`}>{task.title}</div>
        {category?.name && (
          <div className="task-item-category" style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
            {category.color && (
              <span style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: category.color,
                marginRight: '0.5em',
              }} />
            )}
            {category.name}
          </div>
        )}
      </div>
      <button
        className="task-item-edit"
        onClick={onEdit}
        aria-label="Редактировать задачу"
        style={{ background: 'none', border: 'none', color: '#888', fontSize: 22, cursor: 'pointer', marginRight: 4 }}
      >
        <CiEdit />
      </button>
      <button 
        className="task-item-delete"
        onClick={onDelete}
        aria-label="Удалить задачу"
        style={{ background: 'none', border: 'none', color: '#e53935', fontSize: 22, cursor: 'pointer' }}
      >
        <MdDelete />
      </button>
    </div>
  );
};

export default TaskItem;
