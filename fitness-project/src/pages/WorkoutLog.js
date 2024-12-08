import React, { useState } from 'react';
import './Panel.css';

function WorkoutLog() {
  const [searchQueryLeft, setSearchQueryLeft] = useState(''); // State for the left search bar
  const [searchResultsLeft, setSearchResultsLeft] = useState([]); // State for left search results

  const [searchQueryRight, setSearchQueryRight] = useState(''); // State for the right search bar
  const [searchResultsRight, setSearchResultsRight] = useState([]); // State for right search results

  const [selectedItems, setSelectedItems] = useState([]); // State for selected items (food or exercise)

  // Function to handle the search action
  const handleSearch = async (query, setResults, endpoint) => {
    try {
      const response = await fetch(`http://localhost:5000${endpoint}?keyword=${encodeURIComponent(query)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch search results.');
      }
      const data = await response.json();
      if (data.success) {
        setResults(data.foods || data.exercises); // Handle response from either endpoint
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setResults([]);
    }
  };

  // Handle selection of items
  const handleSelectItem = (item) => {
    setSelectedItems((prevSelected) => {
      if (prevSelected.some((selected) => selected.id === item.id)) {
        // If already selected, remove it
        return prevSelected.filter((selected) => selected.id !== item.id);
      } else {
        // Otherwise, add it
        return [...prevSelected, item];
      }
    });
  };

  // Calculate total calories of selected items
  const totalCalories = selectedItems.reduce((total, item) => total + item.calories, 0);

  return (
    <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
      {/* Left Search Section (Food Search) */}
      <div style={{ flex: 1 }}>
        <h2>Workout Log - Food Search</h2>
        <div style={{ margin: '1rem 0' }}>
          <input
            type="text"
            value={searchQueryLeft}
            onChange={(e) => setSearchQueryLeft(e.target.value)}
            placeholder="Search for food..."
            style={{ padding: '0.5rem', width: '60%' }}
          />
          <button
            onClick={() => handleSearch(searchQueryLeft, setSearchResultsLeft, '/search/foods')}
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
        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '0.5rem', borderRadius: '5px' }}>
          {searchResultsLeft.length > 0 ? (
            <ul style={{ textAlign: 'left', listStyleType: 'none', padding: 0, margin: 0 }}>
              {searchResultsLeft.map((food) => (
                <li key={food.id} style={{ marginBottom: '0.5rem' }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedItems.some((item) => item.id === food.id)}
                      onChange={() => handleSelectItem(food)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <strong>{food.name}</strong>: {food.calories} calories
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            searchQueryLeft && <p>No results found for "{searchQueryLeft}"</p>
          )}
        </div>
      </div>

      {/* Right Search Section (Exercise Search) */}
      <div style={{ flex: 1 }}>
        <h2>Workout Log - Exercise Search</h2>
        <div style={{ margin: '1rem 0' }}>
          <input
            type="text"
            value={searchQueryRight}
            onChange={(e) => setSearchQueryRight(e.target.value)}
            placeholder="Search for exercise..."
            style={{ padding: '0.5rem', width: '60%' }}
          />
          <button
            onClick={() => handleSearch(searchQueryRight, setSearchResultsRight, '/search/exercises')}
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
        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '0.5rem', borderRadius: '5px' }}>
          {searchResultsRight.length > 0 ? (
            <ul style={{ textAlign: 'left', listStyleType: 'none', padding: 0, margin: 0 }}>
              {searchResultsRight.map((exercise) => (
                <li key={exercise.id} style={{ marginBottom: '0.5rem' }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedItems.some((item) => item.id === exercise.id)}
                      onChange={() => handleSelectItem(exercise)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <strong>{exercise.name}</strong> ({exercise.type}): {exercise.calories} calories
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            searchQueryRight && <p>No results found for "{searchQueryRight}"</p>
          )}
        </div>
      </div>

      {/* Selected Items Section */}
      {selectedItems.length > 0 && (
        <div style={{ marginTop: '1rem', flex: '1 0 100%' }}>
          <h3>Selected Items</h3>
          <ul style={{ textAlign: 'left', listStyleType: 'none', padding: 0 }}>
            {selectedItems.map((item) => (
              <li key={item.id} style={{ marginBottom: '0.5rem' }}>
                <strong>{item.name}</strong>: {item.calories} calories
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