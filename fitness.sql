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
    
    -- Update goal
    UPDATE fitness_goal
    SET goal_type = p_goal_type
    WHERE user_id = p_user_id;
    
    -- Update user's goal_id reference
    UPDATE user 
    SET goal_id = LAST_INSERT_ID()
    WHERE id = p_user_id;
    
    COMMIT;
END//



-- Stored Procedure for updating user fitness goals
CREATE PROCEDURE insert_user_goal(
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
    
    -- Insert goal
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

