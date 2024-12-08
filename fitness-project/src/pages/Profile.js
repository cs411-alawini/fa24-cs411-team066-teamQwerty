// src/pages/Profile.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Panel.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    fetch('http://localhost:5000/getuser', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok && data.user) {
          setUser(data.user);
        } else {
          setUser(null); // Explicitly set user to null for guest sessions or errors
        }
      })
      .catch(() => {
        setUser(null); // Handle errors gracefully by treating as guest
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className='panel'>Loading...</div>;
  }

  if (error) {
    return <div className='panel'>Error: {error}</div>;
  }

  if (!user) {
    return <div className='panel'>No user data available.</div>;
  }

  return (
    <div className='panel'>
      <h2>User Profile</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email Address:</strong> {user.email}</p>
      <p><strong>Age:</strong> {user.age}</p>
      
      {/* Button to navigate to log-history */}
      <button
        onClick={() => navigate('/log-history')}
        style={{
          marginTop: '1rem',
          padding: '0.8rem 1.5rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '1rem',
        }}
      >
        Go to Log History
      </button>
    </div>
  );
}

export default Profile;