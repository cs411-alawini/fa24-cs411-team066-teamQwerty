// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <h1 className="header-title">Fitness Tracker</h1>
      <nav className="header-nav">
        <Link to="/home" className="header-link">Home</Link>
        <Link to="/dashboard" className="header-link">Dashboard</Link>
        <Link to="/profile" className="header-link">Profile</Link>
      </nav>
      <Link to="/login" className="login-link">Login</Link>
    </header>
  );
}

export default Header;