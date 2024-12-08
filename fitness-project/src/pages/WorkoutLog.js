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
        setResults(data.foods || data.exercises);
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
        return prevSelected.filter((selected) => selected.id !== item.id);
      } else {
        return [...prevSelected, item];
      }
    });
  };

  // Calculate total calories of selected items
  const totalCalories = selectedItems.reduce((total, item) => total + item.calories, 0);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', padding: '2rem' }}>
      {/* Left Panel - Food Search */}
      <div className="panel" style={{ flex: 1, minWidth: '300px' }}>
        <h1>Food Search</h1>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            value={searchQueryLeft}
            onChange={(e) => setSearchQueryLeft(e.target.value)}
            placeholder="Search for food..."
            style={{
              padding: '0.8rem',
              width: '80%',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
          <button onClick={() => handleSearch(searchQueryLeft, setSearchResultsLeft, '/search/foods')} style={{ marginLeft: '0.5rem' }}>
            Search
          </button>
        </div>
        <div style={{ maxHeight: '200px', overflowY: 'auto', textAlign: 'left' }}>
          {searchResultsLeft.length > 0 ? (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
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

      {/* Right Panel - Exercise Search */}
      <div className="panel" style={{ flex: 1, minWidth: '300px' }}>
        <h1>Exercise Search</h1>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            value={searchQueryRight}
            onChange={(e) => setSearchQueryRight(e.target.value)}
            placeholder="Search for exercise..."
            style={{
              padding: '0.8rem',
              width: '80%',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
          <button onClick={() => handleSearch(searchQueryRight, setSearchResultsRight, '/search/exercises')} style={{ marginLeft: '0.5rem' }}>
            Search
          </button>
        </div>
        <div style={{ maxHeight: '200px', overflowY: 'auto', textAlign: 'left' }}>
          {searchResultsRight.length > 0 ? (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
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
      <div className="panel" style={{ flex: '1 0 100%' }}>
        <h1>Selected Items</h1>
        {selectedItems.length > 0 ? (
          <>
            <ul style={{ listStyleType: 'none', padding: 0, textAlign: 'left' }}>
              {selectedItems.map((item) => (
                <li key={item.id}>
                  <strong>{item.name}</strong>: {item.calories} calories
                </li>
              ))}
            </ul>
            <p>Total Calories: <strong>{totalCalories}</strong></p>
          </>
        ) : (
          <p>No items selected.</p>
        )}
      </div>
    </div>
  );
}

export default WorkoutLog;