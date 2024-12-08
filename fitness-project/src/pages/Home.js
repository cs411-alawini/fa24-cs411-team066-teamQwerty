import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './Panel.css';

function Home() {
  const navigate = useNavigate(); // Initialize the navigate function

  return (
    <div className='panel'>
      <h1>Welcome to Fitness Tracker</h1>
      <p>Track your fitness journey and get personalized workout recommendations.</p>
      {/* Update the button to navigate to the goal page */}
      <button 
        style={{ padding: '0.5rem 1rem', marginTop: '1rem' }} 
        onClick={() => navigate('/goal')}
      >
        Get Started
      </button>
    </div>
  );
}

export default Home;