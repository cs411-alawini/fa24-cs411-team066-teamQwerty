from datetime import datetime

from flask import Flask, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
import logging
from sqlalchemy import text



app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# Enable CORS for React frontend
# CORS(app, supports_credentials=True)
logging.basicConfig(level=logging.DEBUG)


# Configurations
app.config['SECRET_KEY'] = '9spKotDJjs'  # Replace with a secure secret key

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:863235@localhost/fitness_demo'

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


# Add these new routes to your Flask application

@app.route('/search/exercises', methods=['GET'])
def search_exercises():
    keyword = request.args.get('keyword', '')

    query = Exercise.query

    if keyword:
        # Case-insensitive search on exercise name and type
        search = f"%{keyword}%"
        query = query.filter(
            db.or_(
                Exercise.exercise_name.ilike(search),
                Exercise.type.ilike(search)
            )
        )

    exercises = query.all()

    return jsonify({
        'success': True,
        'exercises': [{
            'id': exercise.id,
            'name': exercise.exercise_name,
            'calories': exercise.calories,
            'type': exercise.type
        } for exercise in exercises]
    }), 200


@app.route('/search/foods', methods=['GET'])
def search_foods():
    keyword = request.args.get('keyword', '')

    query = Food.query

    if keyword:
        # Case-insensitive search on food name
        search = f"%{keyword}%"
        query = query.filter(Food.name.ilike(search))

    foods = query.all()

    return jsonify({
        'success': True,
        'foods': [{
            'id': food.id,
            'name': food.name,
            'calories': food.calories
        } for food in foods]
    }), 200

@app.route('/workout-log', methods=['POST'])
def add_workout_log():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not authenticated'}), 401

    try:
        data = request.get_json()
        calories_burnt = data.get('calories_burnt')
        
        # 验证输入
        if calories_burnt is None:
            return jsonify({'success': False, 'message': 'Calories burnt is required'}), 400
            
        # 创建新的workout记录
        new_workout = WorkoutLog(
            user_id=session['user_id'],
            calories_burnt=calories_burnt,
            date=datetime.utcnow()  
        )
        
        db.session.add(new_workout)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Workout log added successfully',
            'workout': {
                'id': new_workout.id,
                'date': new_workout.date,
                'calories_burnt': new_workout.calories_burnt
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/workout-logs', methods=['GET'])
def get_workout_logs():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not authenticated'}), 401

    try:
        workout_logs = WorkoutLog.query.filter_by(
            user_id=session['user_id']
        ).order_by(
            WorkoutLog.date.desc()
        ).all()

        # 转换为JSON格式
        logs = []
        for log in workout_logs:
            logs.append({
                'id': log.id,
                'date': log.date.strftime('%Y-%m-%d %H:%M:%S'),
                'calories_burnt': log.calories_burnt
            })

        return jsonify({
            'success': True,
            'workout_logs': logs
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/workout-log/<int:log_id>', methods=['DELETE'])
def delete_workout_log(log_id):
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not authenticated'}), 401

    try:
        # 查找对应的workout log记录
        workout_log = WorkoutLog.query.get(log_id)

        # 检查记录是否存在
        if not workout_log:
            return jsonify({'success': False, 'message': 'Workout log not found'}), 404

        if workout_log.user_id != session['user_id']:
            return jsonify({'success': False, 'message': 'Unauthorized to delete this workout log'}), 403

        db.session.delete(workout_log)
        db.session.commit()

        return jsonify({
            'success': True, 
            'message': 'Workout log deleted successfully'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/fitness-goal', methods=['POST'])
def update_fitness_goal():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not authenticated'}), 401

    data = request.get_json()
    goal_type = data.get('goal_type')

    if not goal_type:
        return jsonify({'success': False, 'message': 'Goal type is required'}), 400

    user_id = session['user_id']

    try:
        # Check if user already has a fitness goal
        existing_goal = FitnessGoal.query.filter_by(user_id=user_id).first()

        if existing_goal:
            db.session.execute(
                text('CALL update_user_goal(:p_user_id, :p_goal_type)'),
                {
                    'p_user_id': user_id,
                    'p_goal_type': goal_type
                }
            )
            db.session.commit()

        else:
            db.session.execute(
                text('CALL insert_user_goal(:p_user_id, :p_goal_type)'),
                {
                    'p_user_id': user_id,
                    'p_goal_type': goal_type
                }
            )
            db.session.commit()

        return jsonify({'success': True, 'message': 'User goal updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


# Optional: Add a GET endpoint to retrieve current fitness goal
@app.route('/fitness-goal', methods=['GET'])
def get_fitness_goal():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not authenticated'}), 401

    user_id = session['user_id']
    goal = FitnessGoal.query.filter_by(user_id=user_id).first()

    if goal:
        return jsonify({
            'success': True,
            'goal': {
                'id': goal.id,
                'goal_type': goal.goal_type
            }
        }), 200
    else:
        return jsonify({
            'success': True,
            'goal': None
        }), 200


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
    # Clear all session data
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200

if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)