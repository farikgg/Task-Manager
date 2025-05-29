import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { login } from '../../api/auth';
import '../../styles/auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { user, token } = await login(formData);
      authLogin(user, token);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при входе');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2 className="auth-title">Вход</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label htmlFor="username" className="auth-label">Имя пользователя</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="password" className="auth-label">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>
          <button type="submit" className="auth-button">
            Войти
          </button>
        </form>
        <p className="auth-link">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
};

export default Login; 