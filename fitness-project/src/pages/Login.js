// src/pages/Login.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();

  const handleGuest = () => {
    navigate('/home'); // 跳转到 Home 页面
  };

  return (
    <div className="auth-container">
      <h2>Welcome to Fitness Tracker</h2> {/* 欢迎消息 */}
      <form>
        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="Enter your email" required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="Enter your password" required />
        </div>
        <button type="submit" className="auth-button">Log In</button>
      </form>
      <div className="auth-links">
        <Link to="/register" className="register-link">Register</Link>
        <button onClick={handleGuest} className="guest-button">Continue as a Guest</button>
      </div>
    </div>
  );
}

export default Login;