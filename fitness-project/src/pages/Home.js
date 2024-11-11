// src/pages/Home.js
import React from 'react';
import './Panel.css';

function Home() {
  return (
    <div className='panel'>
      <h1>Welcome to Fitness Tracker</h1>
      <p>Track your fitness journey and get personalized workout recommendations.</p>
      <button style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>Get Started</button>
    </div>
  );
}

export default Home;