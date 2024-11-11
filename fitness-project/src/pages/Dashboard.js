// src/pages/Dashboard.js
import React from 'react';
import './Panel.css';

function Dashboard() {
  // Example data
  const stats = {
    workouts: 45,
    caloriesBurned: 12345,
    hoursTrained: 150,
  };

  return (
    <div className="panel">
      <h2>Dashboard</h2>
      <div className="stats">
        <p><strong>Total Workouts:</strong> {stats.workouts}</p>
        <p><strong>Calories Burned:</strong> {stats.caloriesBurned}</p>
        <p><strong>Hours Trained:</strong> {stats.hoursTrained}</p>
      </div>
    </div>
  );
}

export default Dashboard;