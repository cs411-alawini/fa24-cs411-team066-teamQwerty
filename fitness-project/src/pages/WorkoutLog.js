import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Panel.css';

function WorkoutLog() {
  const [searchQueryLeft, setSearchQueryLeft] = useState(''); // State for the left search bar
  const [searchResultsLeft, setSearchResultsLeft] = useState([]); // State for left search results

  const [searchQueryRight, setSearchQueryRight] = useState(''); // State for the right search bar
  const [searchResultsRight, setSearchResultsRight] = useState([]); // State for right search results

  const [selectedFoods, setSelectedFoods] = useState([]); // State for selected foods
  const [selectedExercises, setSelectedExercises] = useState([]); // State for selected exercises
  const [message, setMessage] = useState(''); // State for status messages

  const navigate = useNavigate();

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

  // Handle selection of food items
  const handleSelectFood = (food) => {
    setSelectedFoods((prevSelected) => {
      if (prevSelected.some((item) => item.id === food.id)) {
        return prevSelected.filter((item) => item.id !== food.id);
      } else {
        return [...prevSelected, food];
      }
    });
  };

  // Handle selection of exercise items
  const handleSelectExercise = (exercise) => {
    setSelectedExercises((prevSelected) => {
      if (prevSelected.some((item) => item.id === exercise.id)) {
        return prevSelected.filter((item) => item.id !== exercise.id);
      } else {
        return [...prevSelected, exercise];
      }
    });
  };

  // Clear all selected items
  const handleClear = () => {
    setSelectedFoods([]);
    setSelectedExercises([]);
    setMessage('');
  };

  // Save workout log to the database
  const handleSaveLog = async () => {
    try {
      const totalCalories =
        selectedFoods.reduce((total, item) => total + item.calories, 0) -
        selectedExercises.reduce((total, item) => total + item.calories, 0);

      const response = await fetch('http://localhost:5000/workout-log', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calories_burnt: totalCalories,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Workout log saved successfully!');
        setSelectedFoods([]); // Clear the selected foods after saving
        setSelectedExercises([]); // Clear the selected exercises after saving
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error saving workout log:', error);
      setMessage('Error saving workout log.');
    }
  };

  // Calculate total calories
  const totalCalories =
    selectedFoods.reduce((total, item) => total + item.calories, 0) -
    selectedExercises.reduce((total, item) => total + item.calories, 0);

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
                      checked={selectedExercises.some((item) => item.id === exercise.id)}
                      onChange={() => handleSelectExercise(exercise)}
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
        {selectedFoods.length > 0 || selectedExercises.length > 0 ? (
          <>
            <h3>Selected Foods</h3>
            <ul style={{ listStyleType: 'none', padding: 0, textAlign: 'left' }}>
              {selectedFoods.map((food) => (
                <li key={food.id}>
                  <strong>{food.name}</strong>: {food.calories} calories
                </li>
              ))}
            </ul>
            <h3>Selected Exercises</h3>
            <ul style={{ listStyleType: 'none', padding: 0, textAlign: 'left' }}>
              {selectedExercises.map((exercise) => (
                <li key={exercise.id}>
                  <strong>{exercise.name}</strong>: -{exercise.calories} calories
                </li>
              ))}
            </ul>
            <p>Total Calories: <strong>{totalCalories}</strong></p>
            <button
              onClick={handleClear}
              style={{
                padding: '0.8rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                marginRight: '1rem',
                cursor: 'pointer',
              }}
            >
              Clear All
            </button>
            <button
              onClick={handleSaveLog}
              style={{
                padding: '0.8rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Save Log
            </button>
          </>
        ) : (
          <p>No items selected.</p>
        )}
      </div>

      {/* Status Message */}
      {message && (
        <div className="panel" style={{ flex: '1 0 100%', marginTop: '1rem' }}>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}

export default WorkoutLog;