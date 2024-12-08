import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Panel.css';

function LogHistory() {
    const navigate = useNavigate();

    return (
        <div className='panel' style={{ position: 'relative' }}>
            <h1>Log History</h1>
            <p>View your workout log history here.</p>
            <button 
                style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
                onClick={() => navigate('/profile')}
            >
                Back to Profile
            </button>
        </div>
    );
}

export default LogHistory;