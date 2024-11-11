// src/pages/Profile.js
import React from 'react';

function Profile() {
  // Replace with actual user data in a real app
  const user = {
    name: 'John Doe',
    age: 25,
    height: '180 cm',
    weight: '75 kg'
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>User Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Age:</strong> {user.age}</p>
      <p><strong>Height:</strong> {user.height}</p>
      <p><strong>Weight:</strong> {user.weight}</p>
    </div>
  );
}

export default Profile;