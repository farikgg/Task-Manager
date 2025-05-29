import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import UserProfile from './components/profile/UserProfile';
import NotificationList from './components/notifications/NotificationList';

const App = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <Router>
          <NotificationList />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<UserProfile />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;