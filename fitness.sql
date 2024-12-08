-- Advanced Database Features for Fitness Application

-- First drop all existing objects
DROP TRIGGER IF EXISTS before_workout_insert;
DROP TRIGGER IF EXISTS after_workout_log;
DROP PROCEDURE IF EXISTS log_workout;
DROP PROCEDURE IF EXISTS calculate_user_stats;
DROP PROCEDURE IF EXISTS update_user_goal;

-- Add constraints with unique names (remove existing ones first if needed)
ALTER TABLE exercise 
DROP CONSTRAINT exercise_calories_check,
DROP CONSTRAINT exercise_type_check;

ALTER TABLE food 
DROP CONSTRAINT food_calories_check;

-- Now add the constraints with new names to avoid duplicates
ALTER TABLE user
ADD CONSTRAINT user_age_check CHECK (age >= 13 AND age <= 100),
ADD CONSTRAINT user_email_unique UNIQUE (email),
ADD CONSTRAINT user_email_valid CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');

ALTER TABLE exercise
ADD CONSTRAINT exercise_calories_check_new CHECK (calories > 0),
ADD CONSTRAINT exercise_type_check CHECK (type IN ('Strength', 'Cardio', 'Flexibility', 'Balance', 'HIIT'));

ALTER TABLE food
ADD CONSTRAINT food_calories_check_new CHECK (calories >= 0);

-- Trigger to validate workout_log entries
DELIMITER //

CREATE TRIGGER before_workout_insert
BEFORE INSERT ON workout_log
FOR EACH ROW
BEGIN
    -- Validate calories_burnt is positive
    IF NEW.calories_burnt < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Calories burnt must be positive';
    END IF;
    
    -- Validate date is not in future
    IF NEW.date > NOW() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Workout date cannot be in the future';
    END IF;
END//

-- Trigger to update user statistics after workout
CREATE TRIGGER after_workout_log
AFTER INSERT ON workout_log
FOR EACH ROW
BEGIN
    -- Ensure referential integrity
    IF NOT EXISTS (SELECT 1 FROM user WHERE id = NEW.user_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid user_id in workout_log';
    END IF;
END//

-- Stored Procedure for logging a complete workout with exercises
CREATE PROCEDURE log_workout(
    IN p_user_id INT,
    IN p_date DATETIME,
    IN p_calories_burnt INT,
    IN p_exercise_ids VARCHAR(255)
)
BEGIN
    DECLARE workout_id INT;
    DECLARE exit_handler BOOLEAN DEFAULT FALSE;
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET exit_handler = TRUE;
    
    -- Validate user exists
    IF NOT EXISTS (SELECT 1 FROM user WHERE id = p_user_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'User does not exist';
    END IF;
    
    START TRANSACTION;
    
    -- Insert workout log
    INSERT INTO workout_log (user_id, date, calories_burnt)
    VALUES (p_user_id, p_date, p_calories_burnt);
    
    SET workout_id = LAST_INSERT_ID();
    
    -- Insert exercise affiliations
    INSERT INTO affiliations (workout_log_id, exercise_id)
    SELECT workout_id, SUBSTRING_INDEX(SUBSTRING_INDEX(p_exercise_ids, ',', n.n), ',', -1) as exercise_id
    FROM (
        SELECT a.N + b.N * 10 + 1 n
        FROM (SELECT 0 AS N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) a
        ,(SELECT 0 AS N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) b
        ORDER BY n
    ) n
    WHERE n.n <= 1 + (LENGTH(p_exercise_ids) - LENGTH(REPLACE(p_exercise_ids, ',', '')))
    AND SUBSTRING_INDEX(SUBSTRING_INDEX(p_exercise_ids, ',', n.n), ',', -1) != '';
    
    -- Check for errors
    IF exit_handler THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error occurred while logging workout';
    ELSE
        COMMIT;
    END IF;
END//

-- Stored Procedure for calculating user statistics
CREATE PROCEDURE calculate_user_stats(
    IN p_user_id INT,
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    -- Validate user exists
    IF NOT EXISTS (SELECT 1 FROM user WHERE id = p_user_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'User does not exist';
    END IF;

    -- Calculate total workouts, calories burnt, and food intake
    SELECT 
        u.user_name,
        COUNT(DISTINCT wl.id) as total_workouts,
        SUM(wl.calories_burnt) as total_calories_burnt,
        SUM(f.calories) as total_calories_consumed,
        (SELECT goal_type FROM fitness_goal WHERE user_id = p_user_id) as current_goal
    FROM user u
    LEFT JOIN workout_log wl ON u.id = wl.user_id AND wl.date BETWEEN p_start_date AND p_end_date
    LEFT JOIN takein t ON wl.id = t.workout_log_id
    LEFT JOIN food f ON t.food_id = f.id
    WHERE u.id = p_user_id
    GROUP BY u.id, u.user_name;
END//

-- Stored Procedure for updating user fitness goals
CREATE PROCEDURE update_user_goal(
    IN p_user_id INT,
    IN p_goal_type VARCHAR(255)
)
BEGIN    
    -- First check if user exists
    IF NOT EXISTS (SELECT 1 FROM user WHERE id = p_user_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'User does not exist';
    END IF;

    -- Validate goal type with explicit list
    IF p_goal_type NOT IN ('Lose weight', 'Build muscle', 'Maintain fitness', 'Improve endurance') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid goal type';
    END IF;

    START TRANSACTION;
    
    -- Update or insert goal
    INSERT INTO fitness_goal (user_id, goal_type)
    VALUES (p_user_id, p_goal_type)
    ON DUPLICATE KEY UPDATE goal_type = p_goal_type;
    
    -- Update user's goal_id reference
    UPDATE user 
    SET goal_id = LAST_INSERT_ID()
    WHERE id = p_user_id;
    
    COMMIT;
END//

DELIMITER ;

