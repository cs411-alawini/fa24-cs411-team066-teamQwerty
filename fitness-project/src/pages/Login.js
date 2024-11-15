import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();
    setError('');

    const loginData = {
      username,
      password,
    };

    fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          navigate('/home'); // Navigate to home page on successful login
        } else {
          setError(data.message || 'Login failed. Please check your credentials.');
        }
      })
      .catch(() => {
        setError('Failed to connect to the server. Please try again later.');
      });
  };

  const handleGuest = () => {
    navigate('/home'); // Navigate to Home page as a guest
  };

  return (
    <div className="auth-container">
      <h2>Welcome to Fitness Tracker</h2> {/* Welcome message */}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
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