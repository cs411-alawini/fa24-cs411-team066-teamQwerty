// src/pages/Profile.js
import React, { useEffect, useState } from 'react';
import './Panel.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        if (response.ok) {
          setUser(data.user);
        } else {
          throw new Error(data.message || 'Failed to fetch user data');
        }
      })
      .catch((err) => {
        setError(err.message);
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
    </div>
  );
}

export default Profile;