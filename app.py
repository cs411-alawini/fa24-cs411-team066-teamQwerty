from datetime import datetime

from flask import Flask, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
import logging


app = Flask(__name__)

# Enable CORS for React frontend
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
logging.basicConfig(level=logging.DEBUG)


# Configurations
app.config['SECRET_KEY'] = '9spKotDJjs'  # Replace with a secure secret key

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:199988@localhost/fitness_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(255))
    age = db.Column(db.Integer)
    password = db.Column(db.String(255))
    email = db.Column(db.String(255))
    goal_id = db.Column(db.Integer)

    # Relationships
    workout_logs = db.relationship('WorkoutLog', backref='user', lazy=True)
    fitness_goals = db.relationship('FitnessGoal', backref='user', lazy=True)


class Exercise(db.Model):
    __tablename__ = 'exercise'

    id = db.Column(db.Integer, primary_key=True)
    exercise_name = db.Column(db.String(255))
    calories = db.Column(db.Float)
    type = db.Column(db.String(255))

    # Relationships
    workout_logs = db.relationship(
        'WorkoutLog',
        secondary='affiliations',
        backref=db.backref('exercises', lazy='dynamic')
    )


class WorkoutLog(db.Model):
    __tablename__ = 'workout_log'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    date = db.Column(db.DateTime, default=datetime.utcnow)
    calories_burnt = db.Column(db.Integer)

    # Relationships
    foods = db.relationship(
        'Food',
        secondary='takein',
        backref=db.backref('workout_logs', lazy='dynamic')
    )


class Affiliations(db.Model):
    __tablename__ = 'affiliations'

    workout_log_id = db.Column(db.Integer, db.ForeignKey('workout_log.id'), primary_key=True)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercise.id'), primary_key=True)


class FitnessGoal(db.Model):
    __tablename__ = 'fitness_goal'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    goal_type = db.Column(db.String(255))


class Food(db.Model):
    __tablename__ = 'food'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    calories = db.Column(db.Float)


class Takein(db.Model):
    __tablename__ = 'takein'

    food_id = db.Column(db.Integer, db.ForeignKey('food.id'), primary_key=True)
    workout_log_id = db.Column(db.Integer, db.ForeignKey('workout_log.id'), primary_key=True)


@app.route('/getuser', methods=['GET'])
def get_user():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user:
            user_data = {
                'username': user.user_name,
                'email': user.email,
                'age': user.age
            }
            return jsonify({'success': True, 'user': user_data}), 200
        else:
            return jsonify({'success': False, 'message': 'User not found'}), 404
    else:
        return jsonify({'success': False, 'message': 'Not authenticated'}), 401


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    user_name = data.get('username')  # Changed to match user_name in the table
    email = data.get('email')
    password = data.get('password')
    age = data.get('age')

    # Validate input
    if not user_name or not email or not password:
        return jsonify({'success': False, 'message': 'Username, email, and password are required'}), 400

    # Check if the email or username already exists
    if User.query.filter((User.email == email) | (User.user_name == user_name)).first():
        return jsonify({'success': False, 'message': 'Username or email already exists'}), 409

    # Hash the password and create the user
    hashed_password = generate_password_hash(password, method='scrypt')
    new_user = User(
        user_name=user_name,
        email=email,
        password=hashed_password,
        age=age,       # Set to None or handle accordingly
        goal_id=None    # Set to None or handle accordingly
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'success': True, 'message': 'User registered successfully'}), 201


# Login Route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user_name = data.get('username')  # Changed to match user_name in the table
    password = data.get('password')

    # Validate input
    if not user_name or not password:
        return jsonify({'success': False, 'message': 'Username and password are required'}), 400

    # Find the user
    user = User.query.filter_by(user_name=user_name).first()
    if user and check_password_hash(user.password, password):
        # Store user info in session
        session['user_id'] = user.id
        session['username'] = user.user_name
        return jsonify({'success': True, 'message': 'Login successful', 'username': user.user_name}), 200

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
    app.run(host='localhost', port=5000, debug=True)
