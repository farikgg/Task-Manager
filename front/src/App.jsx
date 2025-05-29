import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import UserProfile from './components/profile/UserProfile';
import PrivateRoute from './components/PrivateRoute';
import './styles/theme.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/profile" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App; 