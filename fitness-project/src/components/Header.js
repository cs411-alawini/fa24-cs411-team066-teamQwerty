// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css'; // Import the new CSS file

function Header() {
  return (
    <header className="header">
      <h1 className="header-title">Fitness Tracker</h1>
      <nav className="header-nav">
        <Link to="/" className="header-link">Home</Link>
        <Link to="/dashboard" className="header-link">Dashboard</Link>
        <Link to="/profile" className="header-link">Profile</Link>
      </nav>
    </header>
  );
}

export default Header;