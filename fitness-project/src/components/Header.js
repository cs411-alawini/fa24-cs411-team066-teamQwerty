// src/components/Header.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginStatusContext } from '../contexts/LoginStatusContext';
import './Header.css';

function Header() {
  const { isLoggedIn, disableCredentials } = useContext(LoginStatusContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    disableCredentials();
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <header className="header">
      <h1 className="header-title">Fitness Tracker</h1>
      <nav className="header-nav">
        <button className="header-link" onClick={() => navigate('/home')}>Home</button>
        <button className="header-link" onClick={() => navigate('/dashboard')}>Dashboard</button>
        <button className="header-link" onClick={() => navigate('/profile')}>Profile</button>
      </nav>
      {isLoggedIn ? (
        <button onClick={handleLogout} className="login-button logout-button">Logout</button>
      ) : (
        <button onClick={handleLogin} className="login-button">Login</button>
      )}
    </header>
  );
}

export default Header;