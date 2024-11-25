import React, { useState, useEffect } from 'react';
import './Panel.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/profile', {
      method: 'GET',
      credentials: 'include', // Include cookies for session
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setUser(data.data);
        } else {
          setError(data.message);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="panel"><p>{error}</p></div>;
  }

  if (!user) {
    return <div className="panel"><p>Loading...</p></div>;
  }

  return (
    <div className="panel">
      <h2>User Profile</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email Address:</strong> {user.email}</p>
      <p><strong>Age:</strong> {user.age}</p>
    </div>
  );
}

export default Profile;