from flask import Flask, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import json
import os

app = Flask(__name__)

# Enable CORS for React frontend
CORS(app, supports_credentials=True)

# Configurations
app.config['SECRET_KEY'] = 'your-secret-key'  # Replace with a secure secret key

# File for storing user data
DATA_FILE = 'users.json'

# Initialize the data file if it doesn't exist
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'w') as file:
        json.dump([], file)


# Helper Functions
def read_users():
    """Read users from the JSON file."""
    with open(DATA_FILE, 'r') as file:
        return json.load(file)


def write_users(users):
    """Write users to the JSON file."""
    with open(DATA_FILE, 'w') as file:
        json.dump(users, file, indent=4)


# Register Route
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    # Validate input
    if not username or not name or not email or not password:
        return jsonify({'success': False, 'message': 'All fields are required'}), 400

    users = read_users()

    # Check if the email or username already exists
    if any(user['email'] == email or user['username'] == username for user in users):
        return jsonify({'success': False, 'message': 'Username or email already exists'}), 409

    # Hash the password and create the user
    hashed_password = generate_password_hash(password, method='scrypt')
    new_user = {
        'id': len(users) + 1,
        'username': username,
        'name': name,
        'email': email,
        'password': hashed_password
    }

    users.append(new_user)
    write_users(users)

    return jsonify({'success': True, 'message': 'User registered successfully'}), 201


# Login Route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Validate input
    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password are required'}), 400

    users = read_users()

    # Find the user
    user = next((u for u in users if u['username'] == username), None)
    if user and check_password_hash(user['password'], password):
        # Store user info in session
        session['user_id'] = user['id']
        session['username'] = user['username']
        return jsonify({'success': True, 'message': 'Login successful', 'username': user['username']}), 200

    return jsonify({'success': False, 'message': 'Invalid username or password'}), 401


# Logout Route
@app.route('/logout', methods=['POST'])
def logout():
    if 'user_id' in session:
        session.pop('user_id', None)
        session.pop('username', None)
        return jsonify({'success': True, 'message': 'Logout successful'}), 200
    return jsonify({'success': False, 'message': 'No active session'}), 400


if __name__ == '__main__':
    app.run(debug=True, port = 5000)