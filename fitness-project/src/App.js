// src/App.js
import React, { useEffect } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function App() {
  const location = useLocation();
  const hideHeader = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    const canvas = document.getElementById('sandCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particlesArray = [];
    const numberOfParticles = 1500;

    // 颜色数组，包含多种颜色
    const colors = [
      'rgba(173, 216, 230, 0.8)', // 浅蓝色
      'rgba(135, 206, 235, 0.8)', // 天蓝色
      'rgba(30, 244, 224, 0.8)', // 浅蓝绿色
      'rgba(30, 210, 244, 0.8)', // 浅橙色
      'rgba(30, 210, 244, 0.04)'  // 浅绿色
    ];

    class Particle {
      constructor() {
        // 允许粒子的位置在画布外 +/- 100 像素的范围内
        this.x = Math.random() * (canvas.width + 200) - 100;
        this.y = Math.random() * (canvas.height + 200) - 100;
        this.size = Math.random() * 1000 + 300;
        this.baseSize = this.size;
        
        // 减慢速度，设置为更小的随机值
        this.speedX = (Math.random() * 0.02 - 0.01); // 更慢的水平速度
        this.speedY = (Math.random() * 0.02 - 0.01); // 更慢的垂直速度
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // 模拟波动效果：大小在 80% 到 120% 之间变化
        this.size = this.baseSize * (0.8 + Math.sin(Date.now() / 1000 + this.x) * 0.2);
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    function initParticles() {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesArray.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    }

    initParticles();
    animate();
  }, []);

  return (
    <div className="App">
      <canvas id="sandCanvas"></canvas> {/* 背景层 */}
      {!hideHeader && <Header />}
      <div style={{ padding: '2rem', paddingTop: '4rem', position: 'relative' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
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