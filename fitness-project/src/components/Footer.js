// src/components/Footer.js
import React from 'react';

function Footer() {
  return (
    <footer style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1rem',
      background: '#f1f1f1',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
    }}>
      <p>&copy; 2024 Fitness Tracker. All rights reserved.</p>
    </footer>
  );
}

export default Footer;