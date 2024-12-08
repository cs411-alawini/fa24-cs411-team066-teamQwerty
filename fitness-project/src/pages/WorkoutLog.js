import React, { useState } from 'react';
import './Panel.css';

function WorkoutLog() {
  const [searchQuery, setSearchQuery] = useState(''); // State for search input
  const [searchResults, setSearchResults] = useState([]); // State for search results

  // Function to handle the search action
  const handleSearch = async () => {
    try {
      // Fetch data from the backend at localhost:5000
      const response = await fetch(`http://localhost:5000/search/foods?keyword=${encodeURIComponent(searchQuery)}`, {
        method: 'GET',
        credentials: 'include', // Ensures cookies are sent if necessary
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch search results.');
      }
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.foods);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setSearchResults([]);
    }
  };

  return (
    <div>
      <h2>Workout Log</h2>
      <p>Here you can track and view your workouts.</p>
      {/* Search Bar */}
      <div style={{ margin: '1rem 0' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for food..."
          style={{ padding: '0.5rem', width: '60%' }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '0.5rem 1rem',
            marginLeft: '0.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Search
        </button>
      </div>
      {/* Display Search Results */}
      {searchResults.length > 0 ? (
        <ul style={{ textAlign: 'left', listStyleType: 'none', padding: 0 }}>
          {searchResults.map((food) => (
            <li key={food.id} style={{ marginBottom: '0.5rem' }}>
              <strong>{food.name}</strong>: {food.calories} calories
            </li>
          ))}
        </ul>
      ) : (
        searchQuery && <p>No results found for "{searchQuery}"</p>
      )}
    </div>
  );
}

export default WorkoutLog;