import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './Panel.css';

function Goal() {
  const navigate = useNavigate(); // Initialize the navigate function

  return (
    <div className='panel'>
      <h1>Set your goal before everything</h1>
      <p>Goal here:</p>
      <button 
        style={{ padding: '0.5rem 1rem', marginTop: '1rem' }} 
        onClick={() => navigate('/workout-log')}
      >
        Confirm
      </button>
    </div>
  );
}

export default Goal;