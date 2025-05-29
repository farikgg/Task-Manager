// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';
import '../styles/auth.css';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    try {
      await register({ username, password });
      navigate('/login'); // Перенаправление на вход после регистрации
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при регистрации');
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Регистрация</h1>
      
      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Имя пользователя"
          className="auth-input"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль (мин. 6 символов)"
          className="auth-input"
          required
        />

        <button type="submit" className="auth-button">
          Зарегистрироваться
        </button>
      </form>

      <a href="http://localhost:5000/api/auth/google" className="auth-button" style={{ background: '#fff', color: '#444', border: '1px solid #ccc', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: 20, marginRight: 8 }} />
        Зарегистрироваться через Google
      </a>

      <div className="auth-link">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </div>
    </div>
  );
};

export default RegisterPage;