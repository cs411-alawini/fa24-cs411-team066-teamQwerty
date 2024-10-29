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
DROP TABLE IF EXISTS user;
CREATE TABLE user (
    id INT PRIMARY KEY,
    user_name VARCHAR(255),
    age INT,
    password VARCHAR(255),
    email VARCHAR(255),
    goal_id INT
);

DROP TABLE IF EXISTS exercise;
CREATE TABLE exercise (
    id INT PRIMARY KEY,
    exercise_name VARCHAR(255),
    calories REAL,
    type VARCHAR(255)
);

DROP TABLE IF EXISTS workout_log;
CREATE TABLE workout_log (
    id INT PRIMARY KEY,
    user_id INT,
    date TIMESTAMP,
    calories_burnt INT,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

DROP TABLE IF EXISTS affiliations;
CREATE TABLE affiliations ( # relation table between workout_log & exercise
    workout_log_id INT,
    exercise_id INT,
    PRIMARY KEY (workout_log_id, exercise_id),
    FOREIGN KEY (workout_log_id) REFERENCES workout_log(id),
    FOREIGN KEY (exercise_id) REFERENCES exercise(id)
);

DROP TABLE IF EXISTS fitness_goal;
CREATE TABLE fitness_goal (
    id INT PRIMARY KEY,
    user_id INT,
    goal_type VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES user(id)
);

DROP TABLE IF EXISTS food;
CREATE TABLE food (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    calories REAL
);

DROP TABLE IF EXISTS takein;
CREATE TABLE takein ( # relation table between workout_log & food
    food_id INT,
    workout_log_id INT,
    PRIMARY KEY (food_id, workout_log_id),
    FOREIGN KEY (food_id) REFERENCES food(id),
    FOREIGN KEY (workout_log_id) REFERENCES workout_log(id)
);

```

## Data Insertion

We used [DataGrip](https://www.jetbrains.com/datagrip/). Firstly we connect DataGrip to our local machine, then [DataGrip](https://www.jetbrains.com/datagrip/) allows us to import the data using .csv or .xlsx file. We created 7 .csv or .xlsx files, headers align the same as our tables' headers and insert these files to our tables successfully.

We include 5 of them in our doc folder, and the rest two were created by hand.

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

Result Screenshot:

![00](doc/screenShot/00.png)

We have 10 results here because we only have 10 rows for workout_log.

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

Result screenshot:

![1730237383366](images/STAGE3/1730237383366.png)

We have 4 results here because we only have 5 rows for takein, and only 4 of them satified SUM(f.calories) > 50.

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

Result Screenshot:

![1730237484397](images/STAGE3/1730237484397.png)

We have 1 result here because we are looking for the most recent workout.

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

Result Screenshot:

![1730237549228](images/STAGE3/1730237549228.png)

We have 2 results here because we searched for one certain user's performed exercise and consumed food.
