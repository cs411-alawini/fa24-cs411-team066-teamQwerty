import React, { useState } from 'react';
import './Panel.css';

function WorkoutLog() {
  const [searchQuery, setSearchQuery] = useState(''); // State for search input
  const [searchResults, setSearchResults] = useState([]); // State for search results
  const [selectedFoods, setSelectedFoods] = useState([]); // State for selected foods

  // Function to handle the search action
  const handleSearch = async () => {
    try {
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

  // Handle selection of food items
  const handleSelectFood = (food) => {
    setSelectedFoods((prevSelected) => {
      if (prevSelected.some((item) => item.id === food.id)) {
        // If already selected, remove it
        return prevSelected.filter((item) => item.id !== food.id);
      } else {
        // Otherwise, add it
        return [...prevSelected, food];
      }
    });
  };

  // Calculate total calories of selected foods
  const totalCalories = selectedFoods.reduce((total, food) => total + food.calories, 0);

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
      <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '0.5rem', borderRadius: '5px' }}>
        {searchResults.length > 0 ? (
          <ul style={{ textAlign: 'left', listStyleType: 'none', padding: 0, margin: 0 }}>
            {searchResults.map((food) => (
              <li key={food.id} style={{ marginBottom: '0.5rem' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedFoods.some((item) => item.id === food.id)}
                    onChange={() => handleSelectFood(food)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <strong>{food.name}</strong>: {food.calories} calories
                </label>
              </li>
            ))}
          </ul>
        ) : (
          searchQuery && <p>No results found for "{searchQuery}"</p>
        )}
      </div>
      {/* Display Selected Foods and Total Calories */}
      {selectedFoods.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Selected Foods</h3>
          <ul style={{ textAlign: 'left', listStyleType: 'none', padding: 0 }}>
            {selectedFoods.map((food) => (
              <li key={food.id} style={{ marginBottom: '0.5rem' }}>
                <strong>{food.name}</strong>: {food.calories} calories
              </li>
            ))}
          </ul>
          <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>Total Calories: {totalCalories}</p>
        </div>
      )}
    </div>
  );
}

export default WorkoutLog;