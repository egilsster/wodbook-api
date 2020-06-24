use crate::errors::AppError;

/// Validates the workout measurement, returns nothing if successful
/// and an error otherwise.
pub fn validate_workout_measurement(measurement: &str) -> Result<(), AppError> {
    match measurement {
        "time" => Ok(()),
        "distance" => Ok(()),
        "load" => Ok(()),
        "repetitions" => Ok(()),
        "rounds" => Ok(()),
        "timed_rounds" => Ok(()),
        "tabata" => Ok(()),
        "total" => Ok(()),
        "none" => Ok(()),
        _ => Err(AppError::UnprocessableEntity(
            "Invalid measurement".to_owned(),
        )),
    }
}

/// Validates the movement measurement, returns nothing if successful
/// and an error otherwise.
pub fn validate_movement_measurement(measurement: &str) -> Result<(), AppError> {
    match measurement {
        "weight" => Ok(()),
        "distance" => Ok(()),
        "reps" => Ok(()),
        "height" => Ok(()),
        _ => Err(AppError::UnprocessableEntity(
            "Invalid measurement".to_owned(),
        )),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_workout_measurement() {
        assert!(validate_workout_measurement("time").is_ok());
        assert!(validate_workout_measurement("distance").is_ok());
        assert!(validate_workout_measurement("load").is_ok());
        assert!(validate_workout_measurement("repetitions").is_ok());
        assert!(validate_workout_measurement("rounds").is_ok());
        assert!(validate_workout_measurement("timed_rounds").is_ok());
        assert!(validate_workout_measurement("tabata").is_ok());
        assert!(validate_workout_measurement("total").is_ok());
        assert!(validate_workout_measurement("none").is_ok());
        assert!(validate_workout_measurement("invalid").is_err());
    }

    #[test]
    fn test_validate_movement_measurement() {
        assert!(validate_movement_measurement("weight").is_ok());
        assert!(validate_movement_measurement("distance").is_ok());
        assert!(validate_movement_measurement("reps").is_ok());
        assert!(validate_movement_measurement("height").is_ok());
        assert!(validate_movement_measurement("invalid").is_err());
    }
}
