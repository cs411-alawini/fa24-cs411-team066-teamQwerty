import pandas as pd
from app import app, db, User, Exercise, WorkoutLog, Affiliations, FitnessGoal, Food, Takein

def load_data():
    with app.app_context():
        try:
            # Dictionary to store old_id -> new_id mappings
            user_id_map = {}
            
            # Load users and keep track of their new IDs
            print("Loading users...")
            users_df = pd.read_csv('doc/dataSource/user.csv')
            for _, row in users_df.iterrows():
                old_id = row['id']
                user = User(
                    user_name=row['user_name'],
                    age=row['age'],
                    password=row['password'],
                    email=row['email'],
                    goal_id=row['goal_id'] if 'goal_id' in row else None
                )
                db.session.add(user)
                db.session.flush()  # This will populate the user.id
                user_id_map[old_id] = user.id
            db.session.commit()
            print("Users loaded successfully!")

            # Load exercises
            print("Loading exercises...")
            exercises_df = pd.read_csv('doc/dataSource/exercise.csv')
            exercise_id_map = {}
            for _, row in exercises_df.iterrows():
                old_id = row['id']
                exercise = Exercise(
                    exercise_name=row['exercise_name'],
                    calories=row['calories'],
                    type=row['type']
                )
                db.session.add(exercise)
                db.session.flush()
                exercise_id_map[old_id] = exercise.id
            db.session.commit()
            print("Exercises loaded successfully!")

            # Load food
            print("Loading food...")
            food_df = pd.read_csv('doc/dataSource/food.csv')
            food_id_map = {}
            for _, row in food_df.iterrows():
                old_id = row['id']
                food = Food(
                    name=row['name'],
                    calories=row['calories']
                )
                db.session.add(food)
                db.session.flush()
                food_id_map[old_id] = food.id
            db.session.commit()
            print("Food loaded successfully!")

            # Load fitness goals with mapped user_ids
            print("Loading fitness goals...")
            goals_df = pd.read_csv('doc/dataSource/fitness_goal.csv')
            for _, row in goals_df.iterrows():
                old_user_id = row['user_id']
                new_user_id = user_id_map.get(old_user_id)
                if new_user_id:
                    goal = FitnessGoal(
                        user_id=new_user_id,
                        goal_type=row['goal_type']
                    )
                    db.session.add(goal)
            db.session.commit()
            print("Fitness goals loaded successfully!")

            # Load workout logs with mapped user_ids
            print("Loading workout logs...")
            logs_df = pd.read_csv('doc/dataSource/workout_log.csv')
            workout_id_map = {}
            for _, row in logs_df.iterrows():
                old_id = row['id']
                old_user_id = row['user_id']
                new_user_id = user_id_map.get(old_user_id)
                if new_user_id:
                    log = WorkoutLog(
                        user_id=new_user_id,
                        date=pd.to_datetime(row['date']),
                        calories_burnt=row['calories_burnt']
                    )
                    db.session.add(log)
                    db.session.flush()
                    workout_id_map[old_id] = log.id
            db.session.commit()
            print("Workout logs loaded successfully!")

            # Load affiliations with mapped IDs
            print("Loading affiliations...")
            aff_df = pd.read_csv('doc/dataSource/affiliations.csv')
            for _, row in aff_df.iterrows():
                old_workout_id = row['workout_log_id']
                old_exercise_id = row['exercise_id']
                new_workout_id = workout_id_map.get(old_workout_id)
                new_exercise_id = exercise_id_map.get(old_exercise_id)
                if new_workout_id and new_exercise_id:
                    aff = Affiliations(
                        workout_log_id=new_workout_id,
                        exercise_id=new_exercise_id
                    )
                    db.session.add(aff)
            db.session.commit()
            print("Affiliations loaded successfully!")

            # Load takein relationships with mapped IDs
            print("Loading takein relationships...")
            takein_df = pd.read_csv('doc/dataSource/takein.csv')
            for _, row in takein_df.iterrows():
                old_food_id = row['food_id']
                old_workout_id = row['workout_log_id']
                new_food_id = food_id_map.get(old_food_id)
                new_workout_id = workout_id_map.get(old_workout_id)
                if new_food_id and new_workout_id:
                    takein = Takein(
                        food_id=new_food_id,
                        workout_log_id=new_workout_id
                    )
                    db.session.add(takein)
            db.session.commit()
            print("Takein relationships loaded successfully!")

            print("All data loaded successfully!")

        except Exception as e:
            print(f"Error occurred: {str(e)}")
            db.session.rollback()
            raise e

if __name__ == '__main__':
    load_data()