import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Panel.css';

function LogHistory() {
  const [logs, setLogs] = useState([]); // State for storing logs
  const [loading, setLoading] = useState(true); // Loading state
  const [message, setMessage] = useState(''); // State for status messages
  const navigate = useNavigate();

  // Fetch logs from the backend
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/workout-logs', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch logs.');
      }

      const data = await response.json();
      if (data.success) {
        setLogs(data.workout_logs);
      } else {
        setMessage('No logs found.');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setMessage('Error fetching logs.');
    } finally {
      setLoading(false);
    }
  };

  // Delete a log
  const handleDeleteLog = async (logId) => {
    try {
      const response = await fetch(`http://localhost:5000/workout-log/${logId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete log.');
      }

      const data = await response.json();
      if (data.success) {
        setLogs((prevLogs) => prevLogs.filter((log) => log.id !== logId));
        setMessage('Log deleted successfully.');
      } else {
        setMessage('Failed to delete log.');
      }
    } catch (error) {
      console.error('Error deleting log:', error);
      setMessage('Error deleting log.');
    }
  };

  // Fetch logs on component mount
  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="panel" style={{ position: 'relative', maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <h1>My Workout Log History</h1>

      {loading ? (
        <p>Loading logs...</p >
      ) : logs.length > 0 ? (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {logs.map((log) => (
            <li
              key={log.id}
              style={{
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #ddd',
                paddingBottom: '0.5rem',
              }}
            >
              <div>
                <strong>Date:</strong> {log.date} <br />
                <strong>Calories Burnt:</strong> {log.calories_burnt}
              </div>
              <button
                onClick={() => handleDeleteLog(log.id)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>{message || 'No logs available.'}</p >
      )}

      <button
        onClick={() => navigate('/profile')}
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Back to Profile
      </button>
    </div>
  );
}

export default LogHistory;