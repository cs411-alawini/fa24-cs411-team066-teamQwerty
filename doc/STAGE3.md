# Stage 3

Stage 3 is about Database Implementation and Indexing, we used local MySQL to create and build tables.

## Database Setup

```bash
CREATE DATABASE fitness_database;
USE fitness_database;
```

This command creates a new database called fitness_database and sets it as the active database.

## Schema Design

Below are the SQL statements to create the necessary tables and defin relationships.

```bash
CREATE TABLE user (
    id INT PRIMARY KEY,
    user_name VARCHAR(255),
    age INT,
    password VARCHAR(255),
    email VARCHAR(255),
    goal_id INT
);

CREATE TABLE exercise (
    id INT PRIMARY KEY,
    exercise_name VARCHAR(255),
    calories REAL,
    type VARCHAR(255)
);

CREATE TABLE workout_log (
    id INT PRIMARY KEY,
    user_id INT,
    date TIMESTAMP,
    calories_burnt INT,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE affiliations ( # relation table between workout_log & exercise
    workout_log_id INT,
    exercise_id INT,
    PRIMARY KEY (workout_log_id, exercise_id),
    FOREIGN KEY (workout_log_id) REFERENCES workout_log(id),
    FOREIGN KEY (exercise_id) REFERENCES exercise(id)
);

CREATE TABLE fitness_goal (
    id INT PRIMARY KEY,
    user_id INT,
    goal_type VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE food (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    calories REAL
);

CREATE TABLE takein ( # relation table between workout_log & food
    food_id INT,
    workout_log_id INT,
    PRIMARY KEY (food_id, workout_log_id),
    FOREIGN KEY (food_id) REFERENCES food(id),
    FOREIGN KEY (workout_log_id) REFERENCES workout_log(id)
);

```

## SQL Queries

### Total Calories Burned by Each User

This query aggregates the total calories burned by each user and sorts them in descending order.

```bash
SELECT u.user_name, SUM(wl.calories_burnt) AS total_calories_burnt
FROM user u
JOIN workout_log wl ON u.id = wl.user_id
GROUP BY u.user_name
ORDER BY total_calories_burnt DESC;
```

### Users Who Consumed More Than 50 Calories

This query identifies users who consumed more than 50 calories during one workout session.

```bash
SELECT u.user_name, SUM(f.calories) AS total_calories_consumed
FROM user u
JOIN workout_log wl ON u.id = wl.user_id
JOIN takein t ON wl.id = t.workout_log_id
JOIN food f ON t.food_id = f.id
GROUP BY u.user_name
HAVING SUM(f.calories) > 50;
```

### User's Fitness Goal Based on Most Recent Workout

This query retrieves the fitness goal for users with the most recent workout log.

```bash
SELECT u.user_name, fg.goal_type
FROM user u
JOIN fitness_goal fg ON u.id = fg.user_id
WHERE u.id IN (
    SELECT user_id
    FROM workout_log
    WHERE date = (SELECT MAX(date) FROM workout_log)
);
```

### Retrieve User Activites

This query returns the exercises performed and food consumed by a specific user (ID: 388)

```bash
SELECT e.exercise_name AS log, 'Workout Log' AS source
FROM affiliations a
JOIN exercise e ON a.exercise_id = e.id
JOIN workout_log wl ON a.workout_log_id = wl.id
WHERE wl.user_id = 388

UNION

SELECT f.name AS log, 'Food Intake' AS source
FROM takein t
JOIN food f ON t.food_id = f.id
JOIN workout_log wl ON t.workout_log_id = wl.id
WHERE wl.user_id = 388;
```

[](https://)
