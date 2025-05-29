import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile, updateProfile, changePassword } from '../../api/auth';
import { FaUser, FaEnvelope, FaPlus, FaTrash, FaPalette, FaList, FaEdit, FaSave, FaHome } from 'react-icons/fa';
import '../../styles/profile.css';
import { getCategories, createCategory } from '../../api/categories';
import Select from 'react-select';

const UserProfile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedColor, setSelectedColor] = useState('blue');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const BASE_COLORS = [
    '#7d7d7d', '#2ba9fc', '#FFE66D', '#FF6B6B', '#6BCB77', '#4D96FF', '#FFD93D'
  ];
  const [newCategoryColor, setNewCategoryColor] = useState('');

  const colors = [
    { name: 'blue', label: 'Синий', value: 'var(--primary)' },
    { name: 'purple', label: 'Фиолетовый', value: 'var(--color-purple)' },
    { name: 'green', label: 'Зеленый', value: 'var(--color-green)' },
    { name: 'pink', label: 'Розовый', value: 'var(--color-pink)' },
    { name: 'orange', label: 'Оранжевый', value: 'var(--color-orange)' },
    { name: 'teal', label: 'Бирюзовый', value: 'var(--color-teal)' },
    { name: 'indigo', label: 'Индиго', value: 'var(--color-indigo)' },
  ];

  useEffect(() => {
    const savedColor = localStorage.getItem('themeColor');
    if (savedColor) {
      setSelectedColor(savedColor);
      document.documentElement.style.setProperty('--primary', `var(--color-${savedColor})`);
      document.documentElement.style.setProperty('--primary-light', `var(--color-${savedColor}-light)`);
      document.documentElement.style.setProperty('--primary-dark', `var(--color-${savedColor}-dark)`);
    }
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      setFormData({
        username: data.username || '',
        email: data.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setCategories(data.categories || []);
      if (!localStorage.getItem('themeColor')) {
        setSelectedColor(data.themeColor || 'blue');
      }
      setLoading(false);
    } catch (err) {
      setError('Ошибка при загрузке профиля');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) {
      errors.username = 'Имя обязательно для заполнения';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email обязателен для заполнения';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Некорректный email';
    }
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        errors.currentPassword = 'Введите текущий пароль';
      }
      if (formData.newPassword.length < 6) {
        errors.newPassword = 'Пароль должен быть не менее 6 символов';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Пароли не совпадают';
      }
    }
    return errors;
  };

  const handleSaveProfile = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await updateProfile({
        username: formData.username,
        email: formData.email
      });

      if (formData.newPassword) {
        await changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        });
      }

      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setFormErrors({});
      setIsEditing(false);
      loadProfile();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при обновлении профиля');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim() || !newCategoryColor) return;
    try {
      await createCategory({ name: newCategory.trim(), color: newCategoryColor });
      setNewCategory('');
      setNewCategoryColor('');
      const updated = await getCategories();
      setCategories(updated);
    } catch (err) {
      setError('Ошибка при добавлении категории');
    }
  };

  const handleRemoveCategory = (categoryId) => {
    setCategories(prev => prev.filter(c => c._id !== categoryId));
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    document.documentElement.style.setProperty('--primary', `var(--color-${color})`);
    document.documentElement.style.setProperty('--primary-light', `var(--color-${color}-light)`);
    document.documentElement.style.setProperty('--primary-dark', `var(--color-${color}-dark)`);
    localStorage.setItem('themeColor', color);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const colorOptions = BASE_COLORS
    .filter(color => !categories.some(cat => cat.color === color))
    .map(color => ({
      value: color,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-block',
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: color,
            border: '1px solid #ccc'
          }} />
          {color}
        </div>
      )
    }));

  if (loading) {
    return <div className="profile-container">Загрузка...</div>;
  }

  if (!profile) {
    return <div className="profile-container">Ошибка загрузки профиля</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button 
          className="profile-button profile-button-home"
          onClick={() => navigate('/')}
          title="На главную"
          style={{ position: 'absolute', left: 24, top: 24, width: 32, height: 32, minWidth: 32, minHeight: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}
        >
          <FaHome style={{ fontSize: 16 }} />
        </button>
        <h1 className="profile-title" style={{ width: '100%', textAlign: 'center', marginLeft: 0 }}>Профиль пользователя</h1>
      </div>
      
      <div className="profile-tabs">
        <button 
          className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FaUser /> Профиль
        </button>
        <button 
          className={`profile-tab ${activeTab === 'personalization' ? 'active' : ''}`}
          onClick={() => setActiveTab('personalization')}
        >
          <FaPalette /> Персонализация
        </button>
        <button 
          className={`profile-tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <FaList /> Категории
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="profile-info">
          {!isEditing ? (
            <>
              <div className="profile-info-row"><FaUser /> Имя: {profile?.isGoogle ? profile.google_username : profile.username || 'не указано'}</div>
              <div className="profile-info-row"><FaEnvelope /> Email: {profile?.isGoogle ? profile.google_email : profile.email || 'не указано'}</div>
              {!profile?.isGoogle && (
                <div className="profile-buttons">
                  <button 
                    type="button" 
                    className="profile-button"
                    onClick={() => setIsEditing(true)}
                  >
                    <FaEdit /> Редактировать
                  </button>
                </div>
              )}
            </>
          ) : (
            !profile?.isGoogle && (
              <form className="profile-form" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                <div className="profile-form-group">
                  <label className="profile-label">Имя</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`profile-input ${formErrors.username ? 'profile-input-error' : ''}`}
                  />
                  {formErrors.username && <span className="profile-error">{formErrors.username}</span>}
                </div>
                <div className="profile-form-group">
                  <label className="profile-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`profile-input ${formErrors.email ? 'profile-input-error' : ''}`}
                  />
                  {formErrors.email && <span className="profile-error">{formErrors.email}</span>}
                </div>
                <div className="profile-form-group">
                  <label className="profile-label">Текущий пароль</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className={`profile-input ${formErrors.currentPassword ? 'profile-input-error' : ''}`}
                  />
                  {formErrors.currentPassword && <span className="profile-error">{formErrors.currentPassword}</span>}
                </div>
                <div className="profile-form-group">
                  <label className="profile-label">Новый пароль</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={`profile-input ${formErrors.newPassword ? 'profile-input-error' : ''}`}
                  />
                  {formErrors.newPassword && <span className="profile-error">{formErrors.newPassword}</span>}
                </div>
                <div className="profile-form-group">
                  <label className="profile-label">Подтвердите новый пароль</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`profile-input ${formErrors.confirmPassword ? 'profile-input-error' : ''}`}
                  />
                  {formErrors.confirmPassword && <span className="profile-error">{formErrors.confirmPassword}</span>}
                </div>
                {error && <div className="profile-error">{error}</div>}
                <div className="profile-buttons">
                  <button type="submit" className="profile-button">
                    <FaSave /> Сохранить
                  </button>
                  <button 
                    type="button" 
                    className="profile-button profile-button-cancel"
                    onClick={() => {
                      setIsEditing(false);
                      setFormErrors({});
                      setError('');
                      loadProfile();
                    }}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            )
          )}
        </div>
      )}

      {activeTab === 'personalization' && (
        <div className="profile-personalization">
          <div className="color-picker">
            <h3>Цветовая схема</h3>
            <div className="color-options">
              {colors.map(color => (
                <button
                  key={color.name}
                  className={`color-option ${selectedColor === color.name ? 'active' : ''}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => handleColorChange(color.name)}
                  title={color.label}
                />
              ))}
            </div>
          </div>
          {error && <div className="profile-error">{error}</div>}
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="profile-categories">
          <div className="categories-section">
            <h3>Мои категории</h3>
            <div className="categories-list">
              {categories.map(category => (
                <div key={category._id} className="category-item">
                  <span>
                    <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', background: category.color, marginRight: 6, border: '1px solid #ccc', verticalAlign: 'middle' }} />
                    {category.name}
                  </span>
                  <button 
                    className="category-remove"
                    onClick={() => handleRemoveCategory(category._id)}
                    title="Удалить категорию"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
            <div className="category-add" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: 420, margin: '0.5rem 0 1.5rem 0' }}>
              <input
                type="text"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                placeholder="Новая категория"
                className="profile-input"
                style={{ flex: 2, minWidth: 0 }}
              />
              <div style={{ minWidth: 120, flex: 1 }}>
                <Select
                  value={colorOptions.find(opt => opt.value === newCategoryColor) || null}
                  onChange={opt => setNewCategoryColor(opt ? opt.value : '')}
                  options={colorOptions}
                  placeholder="Цвет"
                  isClearable
                  styles={{
                    option: (provided) => ({ ...provided, display: 'flex', alignItems: 'center', gap: 8 }),
                    singleValue: (provided) => ({ ...provided, display: 'flex', alignItems: 'center', gap: 8 }),
                  }}
                />
              </div>
              <button 
                className="profile-button"
                onClick={handleAddCategory}
                style={{ minWidth: 44, padding: '0.5em 1.2em', borderRadius: 8, fontWeight: 600 }}
              >
                <FaPlus />
              </button>
            </div>
            {error && <div className="profile-error">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 