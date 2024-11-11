// src/App.js
import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const location = useLocation();
  
  const hideHeader = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="App">
      {!hideHeader && <Header />}
      <div style={{ padding: '2rem', paddingTop: '4rem' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} /> {/* 重定向到 /login */}
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;