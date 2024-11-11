// src/pages/Dashboard.js
import React from 'react';

function Dashboard() {
  // Example data
  const stats = {
    workouts: 45,
    caloriesBurned: 12345,
    hoursTrained: 150
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Dashboard</h2>
      <div>
        <p><strong>Total Workouts:</strong> {stats.workouts}</p>
        <p><strong>Calories Burned:</strong> {stats.caloriesBurned}</p>
        <p><strong>Hours Trained:</strong> {stats.hoursTrained}</p>
      </div>
    </div>
  );
}

export default Dashboard;