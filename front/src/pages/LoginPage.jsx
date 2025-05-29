import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { login } from '../api/auth';
import '../styles/auth.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const googleToken = params.get('googleToken');
    if (googleToken) {
      localStorage.setItem('accessToken', googleToken);
      navigate('/');
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({username, password});
      navigate('/'); // Перенаправление на главную после входа
    } catch (err) {
      setError('Неверное имя пользователя или пароль');
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Вход</h1>
      
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
          placeholder="Пароль"
          className="auth-input"
          required
        />

        <button type="submit" className="auth-button">
          Войти
        </button>
      </form>

      <a href="http://localhost:5001/api/auth/google" className="auth-button" style={{ background: '#fff', color: '#444', border: '1px solid #ccc', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: 20, marginRight: 8 }} />
        Войти через Google
      </a>

      <div className="auth-link">
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </div>
    </div>
  );
};

export default LoginPage;