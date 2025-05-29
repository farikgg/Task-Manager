import React, { useState } from 'react';
import '../../styles/form.css';

const TaskForm = ({ onSubmit, categories }) => {
  const [taskName, setTaskName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskName.trim() || !selectedCategoryId) {
      alert('Введите название задачи и выберите категорию!');
      return;
    }

    onSubmit({ 
      title: taskName, 
      categories_id: selectedCategoryId
    });
    setTaskName('');
  };

  return (
    <form onSubmit={handleSubmit} className="task-form-row task-form-compact">
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="Новая задача"
          required
          className="form-input task-form-input"
        style={{ minWidth: 0, flex: 2 }}
        />
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          required
          className="form-select task-form-select"
        style={{ minWidth: 120, maxWidth: 180 }}
        >
        <option value="">Категория</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="form-btn task-form-submit"
        style={{ minWidth: 44, padding: '0.5em 1.2em', borderRadius: 8, fontWeight: 600 }}
        >
        +
        </button>
    </form>
  );
};

export default TaskForm;