import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Panel.css';

function Goal() {
  const [selectedGoal, setSelectedGoal] = useState(''); // State for the selected goal
  const [savedGoal, setSavedGoal] = useState(''); // State for the saved goal
  const [message, setMessage] = useState(''); // State for status messages
  const navigate = useNavigate();

  // Fetch the user's saved goal from the backend on component mount
  const fetchSavedGoal = async () => {
    try {
      const response = await fetch('http://localhost:5000/fitness-goal', {
        method: 'GET',
        credentials: 'include', // Ensure session cookies are included
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch saved goal.');
      }

      const data = await response.json();
      if (data.success && data.goal) {
        setSavedGoal(data.goal.goal_type);
      } else {
        setSavedGoal('');
      }
    } catch (error) {
      console.error('Error fetching saved goal:', error);
      setMessage('Error fetching saved goal.');
    }
  };

  // Save the selected goal and navigate to the next page
  const handleConfirm = async () => {
    if (!selectedGoal) {
      alert('Please select a goal before proceeding.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/fitness-goal', {
        method: 'POST',
        credentials: 'include', // Ensure session cookies are included
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goal_type: selectedGoal }),
      });

      if (!response.ok) {
        throw new Error('Failed to update fitness goal.');
      }

      const data = await response.json();
      if (data.success) {
        setSavedGoal(selectedGoal); // Update the saved goal on the page
        setMessage(data.message);
        navigate('/workout-log'); // Navigate to the next page
      } else {
        setMessage(data.message || 'Failed to update fitness goal.');
      }
    } catch (error) {
      console.error('Error updating fitness goal:', error);
      setMessage('Error updating fitness goal.');
    }
  };

  // Fetch the saved goal on component mount
  useEffect(() => {
    fetchSavedGoal();
  }, []);

  return (
    <div className="panel">
      <h1>Set your goal before everything</h1>

      {savedGoal ? (
        <p>
          <strong>Your current goal:</strong> {savedGoal}
        </p>
      ) : (
        <p>You have not set a goal yet.</p>
      )}

      <p>Choose your fitness goal:</p>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <select
          value={selectedGoal}
          onChange={(e) => setSelectedGoal(e.target.value)}
          style={{
            padding: '0.5rem',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '5px',
          }}
        >
          <option value="" disabled>
            Select a goal
          </option>
          <option value="Build Muscle">Build Muscle</option>
          <option value="Lose Weight">Lose Weight</option>
        </select>
      </div>

      <button
        style={{
          padding: '0.5rem 1rem',
          marginTop: '1rem',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
        onClick={handleConfirm}
      >
        Confirm
      </button>
      {message && <p style={{ marginTop: '1rem', color: 'green' }}>{message}</p>}
    </div>
  );
}

export default Goal;