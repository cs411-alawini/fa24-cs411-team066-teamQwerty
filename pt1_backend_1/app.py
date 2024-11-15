# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta, datetime
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import re

app = Flask(__name__)
CORS(app, supports_credentials=True)

# 配置
app.config.update(
    SQLALCHEMY_DATABASE_URI='mysql://username:password@localhost/fitness_database',
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    JWT_SECRET_KEY='your-secret-key',
    JWT_ACCESS_TOKEN_EXPIRES=timedelta(hours=1),
    JWT_REFRESH_TOKEN_EXPIRES=timedelta(days=30),
)

db = SQLAlchemy(app)
jwt = JWTManager(app)
limiter = Limiter(get_remote_address, app=app)

# 令牌黑名单
jwt_blocklist = set()


# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(255), nullable=False)
    age = db.Column(db.Integer)
    password = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True)

    # 移除 goal_id
    workout_logs = db.relationship('WorkoutLog', backref='user', lazy=True)
    fitness_goals = db.relationship('FitnessGoal', backref='user', lazy=True)


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


# 关联表定义
affiliations = db.Table('affiliations',
    db.Column('workout_log_id', db.Integer, db.ForeignKey('workout_log.id'), primary_key=True),
    db.Column('exercise_id', db.Integer, db.ForeignKey('exercise.id'), primary_key=True)
)

takein = db.Table('takein',
    db.Column('food_id', db.Integer, db.ForeignKey('food.id'), primary_key=True),
    db.Column('workout_log_id', db.Integer, db.ForeignKey('workout_log.id'), primary_key=True)
)


class UserSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    token = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_active = db.Column(db.Boolean, default=True)

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
@jwt_required()
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


@app.route('/fitness-goals/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_goals(user_id):
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
@jwt_required()
def create_workout():
    data = request.json
    new_workout = WorkoutLog(
        user_id=data['user_id'],
        calories_burnt=data['calories_burnt']
    )
    db.session.add(new_workout)
    db.session.commit()
    return jsonify({'message': 'Workout log created successfully'}), 201


@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    return jti in jwt_blocklist


# 验证函数
def validate_password(password):
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not any(char.isdigit() for char in password):
        return False, "Password must contain at least one number"
    if not any(char.isupper() for char in password):
        return False, "Password must contain at least one uppercase letter"
    special_chars = "!@#$%^&*(),.?\":{}|<>"
    if not any(char in special_chars for char in password):
        return False, "Password must contain at least one special character"
    return True, "Password is strong"


def validate_email(email):
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return False, "Invalid email format"
    return True, "Email is valid"


# 认证路由
@app.route('/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    data = request.get_json()

    # 验证必需字段
    required_fields = ['email', 'password', 'user_name']
    if not all(field in data for field in required_fields):
        return jsonify({
            'success': False,
            'error': 'Missing required fields',
            'required': required_fields
        }), 400

    # 验证邮箱格式
    is_valid_email, email_message = validate_email(data['email'])
    if not is_valid_email:
        return jsonify({
            'success': False,
            'error': email_message
        }), 400

    # 验证密码强度
    is_valid_password, password_message = validate_password(data['password'])
    if not is_valid_password:
        return jsonify({
            'success': False,
            'error': password_message
        }), 400

    # 检查邮箱是否已存在
    if User.query.filter_by(email=data['email']).first():
        return jsonify({
            'success': False,
            'error': 'Email already exists'
        }), 409

    # 创建新用户
    new_user = User(
        email=data['email'],
        password=generate_password_hash(data['password']),
        user_name=data['user_name'],
        age=data.get('age')
    )

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'User registered successfully'
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Registration failed'
        }), 500


@app.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    data = request.get_json()

    # 验证必需字段
    if not data.get('email') or not data.get('password'):
        return jsonify({
            'success': False,
            'error': 'Email and password are required'
        }), 400

    # 查找用户
    user = User.query.filter_by(email=data['email']).first()

    # 验证用户和密码
    if user and check_password_hash(user.password, data['password']):
        # 创建访问令牌和刷新令牌
        access_token = create_access_token(
            identity=user.id,
            additional_claims={
                'email': user.email,
                'user_name': user.user_name
            }
        )
        refresh_token = create_refresh_token(identity=user.id)

        # 记录用户会话
        session = UserSession(
            user_id=user.id,
            token=access_token,
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        db.session.add(session)
        db.session.commit()

        return jsonify({
            'success': True,
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'user_name': user.user_name
            }
        }), 200

    return jsonify({
        'success': False,
        'error': 'Invalid email or password'
    }), 401


@app.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    return jsonify({
        'success': True,
        'access_token': new_access_token
    }), 200



@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    jwt_blocklist.add(jti)

    # 更新用户会话状态
    current_user = get_jwt_identity()
    UserSession.query.filter_by(
        user_id=current_user,
        is_active=True
    ).update({'is_active': False})
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Successfully logged out'
    }), 200


@app.route('/user/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'id': user.id,
        'email': user.email,
        'user_name': user.user_name,
        'age': user.age
    }), 200


# flask run -h localhost -p 3000
if __name__ == '__main__':
    app.run(debug=True)