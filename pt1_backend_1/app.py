# app.py
from datetime import datetime
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://username:password@localhost/fitness_database'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key'  # 用于加密session
app.config['SESSION_COOKIE_HTTPONLY'] = True

db = SQLAlchemy(app)


# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(255), nullable=False)
    age = db.Column(db.Integer)
    password = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('fitness_goal.id'))

    workout_logs = db.relationship('WorkoutLog', backref='user', lazy=True)
    fitness_goal = db.relationship('FitnessGoal', backref='user', lazy=True)


class Exercise(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    exercise_name = db.Column(db.String(255), nullable=False)
    calories = db.Column(db.Float)
    type = db.Column(db.String(255))


class WorkoutLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    calories_burnt = db.Column(db.Integer)

    exercises = db.relationship('Exercise', secondary='affiliations')
    foods = db.relationship('Food', secondary='takein')


class FitnessGoal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    goal_type = db.Column(db.String(255))


class Food(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    calories = db.Column(db.Float)


# Routes
@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{
        'id': user.id,
        'user_name': user.user_name,
        'age': user.age,
        'email': user.email
    } for user in users])


@app.route('/workout-logs/<int:user_id>', methods=['GET'])
def get_user_workouts(user_id):
    workout_logs = WorkoutLog.query.filter_by(user_id=user_id).all()
    return jsonify([{
        'id': log.id,
        'date': log.date.strftime('%Y-%m-%d %H:%M:%S'),
        'calories_burnt': log.calories_burnt,
        'exercises': [{
            'name': exercise.exercise_name,
            'calories': exercise.calories,
            'type': exercise.type
        } for exercise in log.exercises]
    } for log in workout_logs])


@app.route('/goals', methods=['GET'])
def get_user_goals():
    user_id = session['user_id']
    goals = FitnessGoal.query.filter_by(user_id=user_id).all()
    return jsonify([{
        'id': goal.id,
        'goal_type': goal.goal_type
    } for goal in goals])


@app.route('/foods', methods=['GET'])
def get_foods():
    foods = Food.query.all()
    return jsonify([{
        'id': food.id,
        'name': food.name,
        'calories': food.calories
    } for food in foods])


@app.route('/workout-logs', methods=['POST'])
def create_workout():
    data = request.json
    new_workout = WorkoutLog(
        user_id=data['user_id'],
        calories_burnt=data['calories_burnt']
    )
    db.session.add(new_workout)
    db.session.commit()
    return jsonify({'message': 'Workout log created successfully'}), 201


# 认证相关路由
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # 验证必需字段
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    # 检查邮箱是否已存在
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409

    # 创建新用户
    new_user = User(
        email=data['email'],
        password=generate_password_hash(data['password']),
        user_name=data.get('user_name', ''),
        age=data.get('age')
    )

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    # 验证必需字段
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    # 查找用户
    user = User.query.filter_by(email=data['email']).first()

    # 验证用户和密码
    if user and check_password_hash(user.password, data['password']):
        # 在session中存储用户信息
        session['user_id'] = user.id
        session['email'] = user.email

        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'email': user.email,
                'user_name': user.user_name
            }
        }), 200

    return jsonify({'error': 'Invalid email or password'}), 401


@app.route('/logout', methods=['POST'])
def logout():
    # 清除session
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200


@app.route('/check', methods=['GET'])
def check_auth():
    # 检查用户是否已登录
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        return jsonify({
            'authenticated': True,
            'user': {
                'id': user.id,
                'email': user.email,
                'user_name': user.user_name
            }
        })
    return jsonify({'authenticated': False}), 401


# 受保护的路由示例 - 使用装饰器检查session
def login_required(f):
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Please login first'}), 401
        return f(*args, **kwargs)

    return decorated_function


@app.route('/user/profile', methods=['GET'])
@login_required
def get_profile():
    user = User.query.get(session['user_id'])
    return jsonify({
        'id': user.id,
        'email': user.email,
        'user_name': user.user_name,
        'age': user.age
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)