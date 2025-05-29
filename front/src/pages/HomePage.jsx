import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TaskForm from '../components/tasks/TaskForm';
import TaskItem from '../components/tasks/TaskItem';
import { getTasks, createTask, updateTaskStatus, deleteTask } from '../api/tasks';
import { getCategories } from '../api/categories';
import { logout, getProfile } from '../api/auth';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import ViewToggle from '../components/common/ViewToggle';
import Calendar from '../components/common/Calendar';
import Modal from '../components/common/Modal';
import Navbar from '../components/common/Navbar';
import '../styles/tasklist.css';
import '../styles/calendar.css';
import '../styles/form.css';
import '../styles/modal.css';
import '../styles/homepage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { addNotification } = useNotification();
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('calendar');
  const [modalDate, setModalDate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', category: '', description: '' });
  const [addError, setAddError] = useState('');
  const [editTask, setEditTask] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', category: '', description: '' });
  const [editError, setEditError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [sortCategory, setSortCategory] = useState('all');
  const [sortStatus, setSortStatus] = useState('all');
  const [username, setUsername] = useState('');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Доброе утро';
    } else if (hour >= 12 && hour < 18) {
      return 'Добрый день';
    } else {
      return 'Добрый вечер';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    addNotification('Вы успешно вышли из системы', 'success');
  };

  // Функция для загрузки задач, категорий и профиля пользователя
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [tasksResponse, categoriesResponse, profileResponse] = await Promise.all([
          getTasks(),
          getCategories(),
          getProfile()
        ]);
        setTasks(Array.isArray(tasksResponse) ? tasksResponse : []);
        setCategories(Array.isArray(categoriesResponse) ? categoriesResponse : []);
        setUsername(profileResponse.username || '');
      } catch (error) {
        console.error('Ошибка загрузки:', error);
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
        setTasks([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Добавляем эффект для отслеживания изменений categories
  useEffect(() => {
    console.log('Categories state updated:', categories);
  }, [categories]);

  // Добавление новой задачи
  const handleAddTask = async (newTask) => {
    try {
      const response = await createTask({
        title: newTask.title,
        categories_id: newTask.categories_id,
        isCompleted: false
      });
      if (response.success) {
        setTasks((prevTasks) => [...prevTasks, response.task]);
      }
    } catch (error) {
      addNotification('Не удалось создать задачу', 'error');
    }
  };

  // Обновление статуса задачи
  const handleToggleTask = async (taskId) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    try {
      setError(null);
      const response = await updateTaskStatus(taskId, !task.isCompleted);
      if (response.data?.success) {
        setTasks((prev) =>
          prev.map(t => t._id === taskId ? { ...t, isCompleted: !t.isCompleted } : t)
        );
      }
    } catch (error) {
      console.error('Ошибка обновления задачи:', error);
      setError('Не удалось обновить статус задачи. Пожалуйста, попробуйте позже.');
    }
  };

  // Удаление задачи
  const handleDeleteTask = async (taskId) => {
    try {
      setError(null);
      const response = await deleteTask(taskId);
      if (response.data?.success) {
        setTasks(prev => prev.filter(t => t._id !== taskId));
      }
    } catch (error) {
      console.error('Ошибка удаления задачи:', error);
      setError('Не удалось удалить задачу. Пожалуйста, попробуйте позже.');
    }
  };

  const handleDayClick = (date) => {
    const now = new Date();
    // Сравниваем только дату (без времени)
    const selected = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (selected < today) {
      setShowErrorModal(true);
      setModalDate(null);
    } else {
      setModalDate(date);
      setShowAddModal(true);
    }
  };

  const handleAddInput = (e) => {
    const { name, value } = e.target;
    setAddForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!addForm.title.trim()) {
      setAddError('Название обязательно');
      return;
    }
    try {
      const response = await createTask({
        title: addForm.title,
        categories_id: addForm.category,
        description: addForm.description,
        isCompleted: false,
        dueDate: modalDate.toISOString().slice(0, 10)
      });
      if (response.success) {
        setTasks(prev => [...prev, response.task]);
        setShowAddModal(false);
        setModalDate(null);
        setAddForm({ title: '', category: '', description: '' });
        addNotification('Задача добавлена!', 'success');
      } else {
        setAddError('Ошибка при добавлении задачи');
      }
    } catch (err) {
      setAddError('Ошибка при добавлении задачи');
    }
  };

  // Открытие модального окна редактирования задачи
  const openEditModal = (task) => {
    setEditTask(task);
    setEditForm({
      title: task.title,
      category: task.categories_id,
      description: task.description || ''
    });
    setEditError('');
  };

  // Сохранение изменений задачи
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editForm.title.trim()) {
      setEditError('Название обязательно');
      return;
    }
    try {
      // Здесь должен быть API-запрос на обновление задачи (реализуйте updateTask при необходимости)
      setTasks(prev => prev.map(t => t._id === editTask._id ? {
        ...t,
        title: editForm.title,
        categories_id: editForm.category,
        description: editForm.description
      } : t));
      setEditTask(null);
      addNotification('Задача обновлена!', 'success');
    } catch (err) {
      setEditError('Ошибка при обновлении задачи');
    }
  };

  // Открытие подтверждения удаления
  const openDeleteModal = (taskId) => {
    setDeleteTaskId(taskId);
    setShowDeleteModal(true);
  };

  // Подтверждение удаления
  const handleConfirmDelete = async () => {
    try {
      await deleteTask(deleteTaskId);
      setTasks(prev => prev.filter(t => t._id !== deleteTaskId));
      setShowDeleteModal(false);
      setDeleteTaskId(null);
      addNotification('Задача удалена', 'success');
    } catch (err) {
      addNotification('Ошибка при удалении задачи', 'error');
    }
  };

  if (loading) {
    return <div className="homepage-root" style={{ textAlign: 'center', padding: '2rem' }}>Загрузка...</div>;
  }

  return (
    <div className={`homepage ${theme}`}>
      <Navbar onLogout={handleLogout} />
      <div className="homepage-content">
        <ViewToggle view={view} onViewChange={setView} />
        {error && (
          <div className="form-error">{error}</div>
        )}
        {/* TaskForm только для списка */}
        {view === 'list' && (
          <TaskForm
            onSubmit={handleAddTask}
            categories={categories}
          />
        )}
        {/* UI сортировки */}
        {view === 'list' && (
          <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
            <select value={sortCategory} onChange={e => setSortCategory(e.target.value)}>
              <option value="all">Все категории</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <select value={sortStatus} onChange={e => setSortStatus(e.target.value)}>
              <option value="all">Все задачи</option>
              <option value="completed">Выполненные</option>
              <option value="active">Активные</option>
            </select>
          </div>
        )}
        <div>
          {view === 'list' && (
            (tasks.length > 0 ? (
              <div className="task-list">
                {tasks
                  .filter(task => sortCategory === 'all' || task.categories_id === sortCategory)
                  .filter(task => sortStatus === 'all' || (sortStatus === 'completed' ? task.isCompleted : !task.isCompleted))
                  .map(task => (
                  <div className="task-card" key={task._id}>
                    <TaskItem
                      task={task}
                      category={categories.find(c => c._id === task.categories_id)}
                      onToggle={handleToggleTask}
                      onDelete={() => openDeleteModal(task._id)}
                      onEdit={() => openEditModal(task)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p>Нет задач. Добавьте первую через календарь или строку!</p>
            ))
          )}
          {view === 'calendar' && (
            <Calendar
              tasks={tasks}
              categories={categories}
              onDayClick={handleDayClick}
              onTaskClick={openEditModal}
              onTaskDelete={openDeleteModal}
              onTaskToggle={handleToggleTask}
            />
          )}
        </div>
      </div>
      {/* Модальное окно для добавления задачи */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setModalDate(null); setAddForm({ title: '', category: '', description: '' }); setAddError(''); }} title="Добавить задачу">
        <form onSubmit={handleAddSubmit} className="homepage-modal-form">
          <label>Название задачи *</label>
          <input
            type="text"
            name="title"
            value={addForm.title}
            onChange={handleAddInput}
            placeholder="Введите название"
            autoFocus
          />
          <label>Категория</label>
          <select
            name="category"
            value={addForm.category}
            onChange={handleAddInput}
            className="homepage-modal-select"
          >
            <option value="">Без категории</option>
            {console.log('Categories in select:', categories)}
            {categories.map(cat => (
              <option 
                key={cat._id} 
                value={cat._id}
                style={{ 
                  backgroundColor: cat.color,
                  color: '#fff',
                  padding: '0.5rem'
                }}
              >
                {cat.name}
              </option>
            ))}
          </select>
          <label>Описание</label>
          <textarea
            name="description"
            value={addForm.description}
            onChange={handleAddInput}
            placeholder="Краткое описание (необязательно)"
          />
          <div className="modal-date">Дата: <b>{modalDate && modalDate.toLocaleDateString('ru-RU')}</b></div>
          {addError && <div className="form-error">{addError}</div>}
          <div className="homepage-modal-actions">
            <button
              type="button"
              className="homepage-modal-btn homepage-modal-btn-cancel"
              onClick={() => { setShowAddModal(false); setModalDate(null); setAddForm({ title: '', category: '', description: '' }); setAddError(''); }}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="homepage-modal-btn homepage-modal-btn-primary"
            >
              Добавить
            </button>
          </div>
        </form>
      </Modal>
      {/* Модальное окно для редактирования задачи */}
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Редактировать задачу">
        <form onSubmit={handleEditSubmit} className="homepage-modal-form">
          <label>Название задачи *</label>
          <input
            type="text"
            name="title"
            value={editForm.title}
            onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Введите название"
            autoFocus
          />
          <label>Категория</label>
          <select
            name="category"
            value={editForm.category}
            onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
          >
            <option value="">Без категории</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id} style={{ backgroundColor: cat.color, color: '#fff' }}>{cat.name}</option>
            ))}
          </select>
          <label>Описание</label>
          <textarea
            name="description"
            value={editForm.description}
            onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Краткое описание (необязательно)"
          />
          {editError && <div className="form-error">{editError}</div>}
          <div className="homepage-modal-actions">
            <button
              type="button"
              className="homepage-modal-btn homepage-modal-btn-cancel"
              onClick={() => setEditTask(null)}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="homepage-modal-btn homepage-modal-btn-primary"
            >
              Сохранить
            </button>
          </div>
        </form>
      </Modal>
      {/* Модальное окно для подтверждения удаления */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Удалить задачу?">
        <div className="homepage-modal-center">
          <div className="modal-icon">!</div>
          <div>Вы уверены, что хотите удалить задачу?</div>
          <div className="homepage-modal-actions" style={{ justifyContent: 'center', marginTop: 24 }}>
            <button
              className="homepage-modal-btn homepage-modal-btn-cancel"
              onClick={() => setShowDeleteModal(false)}
            >
              Отмена
            </button>
            <button
              className="homepage-modal-btn homepage-modal-btn-danger"
              onClick={handleConfirmDelete}
            >
              Удалить
            </button>
          </div>
        </div>
      </Modal>
      {/* Модальное окно для ошибки */}
      <Modal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title="Ошибка">
        <div className="homepage-modal-center">
          <div className="modal-icon">!</div>
          <div>Вы не можете добавить событие к уже прошедшей дате</div>
          <button
            className="homepage-modal-btn homepage-modal-btn-primary"
            onClick={() => setShowErrorModal(false)}
            style={{ marginTop: 20 }}
          >
            ОК
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default HomePage;