# Login and Registration Process using React, Flask, and Python

## Overview

This document outlines the workflow for building a login and registration system using React (frontend), Flask + Python (backend), and a database for user data management.

## Frontend (React)

### Responsibilities

- Build the **UI** for login and register pages.
- Capture user input (email, password) via forms.
- Perform client-side **validation** (e.g., email format).
- Send API requests to the backend.
- Display success/error messages based on backend response.
- Handle navigation (e.g., redirect to dashboard after login).

### Implementation

- Use state management (e.g., `useState`, `useEffect`, or Context API) to manage user authentication state.
- Use libraries like **Axios** or `fetch` for API calls.

### Example Workflow

- **Register Page**:
  - User enters email, password, and optional fields (e.g., username).
  - Form data is sent to the backend via a POST request.
- **Login Page**:
  - User enters email and password.
  - Form data is sent to the backend via a POST request.
  - If successful, a JWT token or session token is stored in local storage or cookies.

## Backend (Flask + Python)

### Responsibilities

- Handle user registration and login logic.
- Validate incoming data (e.g., email format, password stength).
- Hash passwords securely using bcrypt.
- Store user details in the database.
- Authenticate user credentials during login.
- Generate and return a JWT token for authenticated users.
- Verify tokens to authorize access to protected endpoints.

### Implementation

- Use Flask-JWT-Extended for token management.
- Use a database to store user data.

### Routes

- /api/register: Accepts email and password, validates data, hashes password, and saves the user to the database.
- /api/login: Validates credentials, checks the hashed password, and generates a JWT token if successful.

### Code sample:

```python
from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token
from datetime import timedelta
import sqlite3

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your_secret_key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Database setup
def init_db():
    with sqlite3.connect('users.db') as conn:
        conn.execute('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE, password TEXT)')

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data['email']
    password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
  
    try:
        with sqlite3.connect('users.db') as conn:
            conn.execute('INSERT INTO users (email, password) VALUES (?, ?)', (email, password))
        return jsonify({'message': 'User registered successfully'}), 201
    except:
        return jsonify({'message': 'Email already exists'}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']
  
    with sqlite3.connect('users.db') as conn:
        user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
        if user and bcrypt.check_password_hash(user[2], password):
            token = create_access_token(identity=email)
            return jsonify({'token': token}), 200
        return jsonify({'message': 'Invalid credentials'}), 401

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
```

## Other things to notice

Thinking about adding a data wrangler role.
