import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { logout, getProfile } from '../../api/auth';
import '../../styles/navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { addNotification } = useNotification();
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

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        setUsername(profile.username || '');
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    addNotification('Вы успешно вышли из системы', 'success');
  };

  return (
    <nav className="navbar-island">
      <h1 className="navbar-title">
        {getGreeting()}, {username}
      </h1>
      <div className="navbar-actions">
        <button
          onClick={toggleTheme}
          className="navbar-btn navbar-btn-theme"
          aria-label={theme === 'light' ? 'Включить темную тему' : 'Включить светлую тему'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="navbar-btn navbar-link"
        >
          Профиль
        </button>
        {/* <Link to="/profile" className="navbar-link">
          Профиль
        </Link> */}
        <button
          onClick={handleLogout}
          className="navbar-btn navbar-btn-logout"
        >
          Выйти
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 