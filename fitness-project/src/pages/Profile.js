// src/pages/Profile.js
import React from 'react';
import './Panel.css';

function Profile() {
  // Replace with actual user data in a real app
  const user = {
    Username: 'John Doe',
    age: 25,
    email: '180 cm',
  };

  return (
    <div className='panel'>
      <h2>User Profile</h2>
      <p><strong>Username:</strong> {user.Username}</p>
      <p><strong>Email Address:</strong> {user.email}</p>
      <p><strong>Age:</strong> {user.age}</p>
    </div>
  );
}

export default Profile;