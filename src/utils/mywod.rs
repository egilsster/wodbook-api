use crate::errors::AppError;
use crate::models::movement::{CreateMovementScore, MovementMeasurement};
use crate::models::mywod::{Athlete, CustomWOD, Movement, MovementSession, MyWOD, MyWodData};
use crate::models::workout::{CreateWorkoutScore, WorkoutMeasurement};
use actix_multipart::Multipart;
use actix_web::web;
use chrono::{DateTime, NaiveDateTime, Utc};
use futures::{StreamExt, TryStreamExt};
use rusqlite::{params, Connection};
use std::fs;
use std::io::Write;
use std::path::Path;

pub const AVATAR_FILE_LOCATION: &str = "./static/avatars";

/// Writes the avatar blob to an image in a static directory and returns
/// an API path to that image.
pub fn save_avatar(user_id: &str, avatar: Vec<u8>) -> Result<String, AppError> {
    let filename = format!("{}.png", user_id);
    let filepath = format!("{}/{}", AVATAR_FILE_LOCATION, filename);

    let mut file = fs::File::create(&filepath)
        .map_err(|_| AppError::Internal(format!("Error creating file: {}", &filepath)))?;
    file.write_all(&avatar)
        .map(|_| file)
        .map_err(|_| AppError::Internal("Saving file failed".to_owned()))?;

    Ok(format!("/avatars/{}", filename))
}

/// Function to write the multiform upload from the user, this file gets
/// handled and all data is attempted to be added for the user.
pub async fn write_payload_to_file(mut payload: Multipart) -> Result<String, AppError> {
    let id = uuid::Uuid::new_v4().to_string();
    let filepath = format!("./tmp/{}", id);

    while let Ok(Some(mut field)) = payload.try_next().await {
        // File::create is blocking operation, use thread-pool
        let fp = filepath.to_owned();
        let mut f = web::block(move || fs::File::create(fp)).await.unwrap();
        // Field in turn is stream of *Bytes* object
        while let Some(chunk) = field.next().await {
            let data = chunk.unwrap();
            // filesystem operations are blocking, we have to use thread-pool
            f = web::block(move || f.write_all(&data).map(|_| f))
                .await
                .map_err(|_| AppError::Internal("Reading myWOD data failed".to_owned()))?;
        }
    }

    Ok(filepath)
}

/// Function that cleans up the myWOD file from the file system after it has been
/// handled and all data has been added for the user.
pub async fn delete_payload_file(filename: String) -> Result<bool, AppError> {
    if Path::new(&filename).exists() {
        fs::remove_file(filename)
            .map_err(|_| AppError::Internal("Could not delete file".to_owned()))?;
    }

    Ok(true)
}

/// Function that reads the mywod database file and returns the contents in
/// a parsed way which is then added to the user profile.
pub async fn read_contents(filename: &str) -> Result<MyWodData, AppError> {
    let db = Connection::open(filename)
        .map_err(|_| AppError::Internal("Error opening connection".to_owned()))?;

    // READING ATHLETE DATA
    let athlete = db
        .prepare("SELECT * FROM Athlete LIMIT 1;")
        .map_err(|_| AppError::Internal("Error reading athlete information".to_owned()))?
        .query_row(params![], |row| {
            Ok(Athlete {
                first_name: row.get(4)?,
                last_name: row.get(5)?,
                email: row.get(6)?,
                height: row.get(7)?,
                weight: row.get(8)?,
                date_of_birth: row.get(10)?,
                box_name: row.get(11)?,
                avatar: row.get(13)?,
            })
        })
        .map_err(|_| AppError::Internal("Error reading athlete data".to_owned()))?;

    let mut workouts: Vec<CustomWOD> = Vec::new();

    // READING WORKOUTS
    db.prepare("SELECT * FROM CustomWODs;")
        .map_err(|_| AppError::Internal("Error reading athlete information".to_owned()))?
        .query_map(params![], |row| {
            Ok(CustomWOD {
                title: row.get(4)?,
                score_type: row.get(5)?,
                description: row.get(6)?,
            })
        })
        .map_err(|_| AppError::Internal("Error reading workouts".to_owned()))?
        .for_each(|workout| {
            if let Ok(workout) = workout {
                // Do not take the sample workout
                if !workout
                    .description
                    .starts_with("This is a sample custom WOD")
                {
                    workouts.push(workout);
                }
            }
        });

    let mut movements: Vec<Movement> = Vec::new();

    // READING MOVEMENTS
    db.prepare("SELECT * FROM Movement;")
        .map_err(|_| AppError::Internal("Error reading movement information".to_owned()))?
        .query_map(params![], |row| {
            Ok(Movement {
                primary_client_id: row.get(0)?,
                primary_record_id: row.get(1)?,
                name: row.get(4)?,
                score_type: row.get(5)?,
            })
        })
        .map_err(|_| AppError::Internal("Error reading movements".to_owned()))?
        .for_each(|movement| {
            if let Ok(movement) = movement {
                movements.push(movement);
            }
        });

    // READING MOVEMENT SCORES
    let mut movement_scores: Vec<MovementSession> = Vec::new();

    db.prepare("SELECT * FROM MovementSessions;")
        .map_err(|_| AppError::Internal("Error reading movement session information".to_owned()))?
        .query_map(params![], |row| {
            Ok(MovementSession {
                foreign_movement_client_id: row.get(2)?,
                foreign_movement_record_id: row.get(3)?,
                date: row.get(6)?,
                measurement_a_value: row.get(7)?,
                measurement_a_units_code: row.get(8)?,
                measurement_b: row.get(9)?,
                sets: row.get(10)?,
                notes: row.get(11)?,
            })
        })
        .map_err(|_| AppError::Internal("Error reading movements".to_owned()))?
        .for_each(|movement_score| {
            if let Ok(movement_score) = movement_score {
                movement_scores.push(movement_score);
            }
        });

    // READING WORKOUT SCORES
    let mut workout_scores: Vec<MyWOD> = Vec::new();

    db.prepare("SELECT * FROM MyWODs;")
        .map_err(|_| AppError::Internal("Error reading movement session information".to_owned()))?
        .query_map(params![], |row| {
            Ok(MyWOD {
                title: row.get(4)?,
                date: row.get(5)?,
                score_type: row.get(6)?,
                score: row.get(7)?,
                as_prescribed: row.get(9)?,
                description: row.get(10)?,
                notes: row.get(11)?,
            })
        })
        .map_err(|_| AppError::Internal("Error reading workout scores".to_owned()))?
        .for_each(|workout_score| {
            if let Ok(workout_score) = workout_score {
                workout_scores.push(workout_score);
            }
        });

    Ok(MyWodData {
        athlete,
        workouts,
        movements,
        movement_scores,
        workout_scores,
    })
}

// Maps the string value from the myWOD database to a one_word string value.
pub fn map_workout_measurement(score_type: &str) -> WorkoutMeasurement {
    match score_type {
        "For Time:" => WorkoutMeasurement::Time,
        "For Distance:" => WorkoutMeasurement::Distance,
        "For Load:" => WorkoutMeasurement::Load,
        "For Repetitions:" => WorkoutMeasurement::Repetitions,
        "For Rounds:" => WorkoutMeasurement::Rounds,
        "For Timed Rounds:" => WorkoutMeasurement::TimedRounds,
        "Tabata Scoring:" => WorkoutMeasurement::Tabata,
        "Total Score:" => WorkoutMeasurement::Total,
        "No Score:" => WorkoutMeasurement::None,
        _ => WorkoutMeasurement::None,
    }
}

/// Maps the score_type from the myWOD database to a string value
pub fn map_movement_measurement(score_type: i32) -> MovementMeasurement {
    match score_type {
        0 => MovementMeasurement::Weight,
        1 => MovementMeasurement::Distance,
        2 => MovementMeasurement::Reps,
        3 => MovementMeasurement::Height,
        _ => MovementMeasurement::None,
    }
}

pub fn parse_workout_score(score: &MyWOD) -> CreateWorkoutScore {
    CreateWorkoutScore {
        score: score.score.to_owned(),
        rx: score.as_prescribed != 0,
        notes: score.notes.to_owned(),
        created_at: Some(parse_short_date(&score.date)),
    }
}

pub fn get_scores_for_movement(
    movement: &Movement,
    movement_scores: &[MovementSession],
) -> Vec<CreateMovementScore> {
    let movement_client_id = movement.primary_client_id.to_owned();
    let movement_id = movement.primary_record_id;
    let movement_type = map_movement_measurement(movement.score_type);

    let mut scores: Vec<CreateMovementScore> = Vec::new();

    for score in movement_scores {
        if score.foreign_movement_client_id == movement_client_id
            && score.foreign_movement_record_id == movement_id
        {
            let new_score = adjust_movement_score_to_measurement(&movement_type, score);
            if let Some(new_score) = new_score {
                scores.push(new_score);
            }
        }
    }

    scores
}

pub fn adjust_movement_score_to_measurement(
    score_type: &MovementMeasurement,
    score: &MovementSession,
) -> Option<CreateMovementScore> {
    let created_at = Some(parse_short_date(score.date.as_ref()));

    match score_type {
        // Lifting
        MovementMeasurement::Weight => Some(CreateMovementScore {
            score: score.measurement_a_value.to_string(),
            sets: score.sets.parse::<u32>().unwrap(),
            reps: score.measurement_b.parse::<u32>().unwrap(),
            distance: "".to_owned(),
            notes: score.notes.to_owned(),
            created_at,
        }),
        // Box jumps
        MovementMeasurement::Height => Some(CreateMovementScore {
            score: score.measurement_a_value.to_string(),
            sets: score.measurement_b.parse::<u32>().unwrap(),
            reps: 1,
            distance: "".to_owned(),
            notes: score.notes.to_owned(),
            created_at,
        }),
        // Rowing, running, etc
        MovementMeasurement::Distance => Some(CreateMovementScore {
            score: score.measurement_b.to_string(),
            sets: score.sets.parse::<u32>().unwrap(),
            reps: 1,
            distance: score.measurement_a_value.to_string(),
            notes: score.notes.to_owned(),
            created_at,
        }),
        // Double unders
        MovementMeasurement::Reps => Some(CreateMovementScore {
            score: "".to_owned(),
            sets: score.sets.parse::<u32>().unwrap(),
            reps: score.measurement_a_value as u32,
            distance: "".to_owned(),
            notes: score.notes.to_owned(),
            created_at,
        }),
        _ => None,
    }
}

/// Parses a date in the format of 'yyyy-mm-dd' to an rf3339 format.
///
/// ## Example
///
/// ```
/// parse_short_date("1991-12-06"); // "1991-12-06T00:00:00+00:00"
/// ```
pub fn parse_short_date(short_date: &str) -> String {
    let date_parsed = NaiveDateTime::parse_from_str(
        format!("{} 00:00:00", short_date).as_ref(),
        "%Y-%m-%d %H:%M:%S",
    )
    .unwrap();
    DateTime::<Utc>::from_utc(date_parsed, Utc).to_rfc3339()
}

#[cfg(test)]
mod tests {
    use super::*;
    use futures_await_test::async_test;

    #[test]
    #[ignore = "fs calls are not working properly in ci"]
    fn test_save_avatar() {
        let res = save_avatar("user_id", vec![0, 1, 2, 3]);
        assert!(res.is_ok());
        assert_eq!(res.unwrap(), "/avatars/user_id.png");
    }

    #[async_test]
    async fn test_read_contents() -> Result<(), AppError> {
        let res = read_contents("data.mywod").await;
        assert!(res.is_ok());
        Ok(())
    }

    #[test]
    fn test_map_workout_measurement() {
        assert_eq!(
            map_workout_measurement("For Time:"),
            WorkoutMeasurement::Time
        );
        assert_eq!(
            map_workout_measurement("For Distance:"),
            WorkoutMeasurement::Distance
        );
        assert_eq!(
            map_workout_measurement("For Load:"),
            WorkoutMeasurement::Load
        );
        assert_eq!(
            map_workout_measurement("For Repetitions:"),
            WorkoutMeasurement::Repetitions
        );
        assert_eq!(
            map_workout_measurement("For Rounds:"),
            WorkoutMeasurement::Rounds
        );
        assert_eq!(
            map_workout_measurement("For Timed Rounds:"),
            WorkoutMeasurement::TimedRounds
        );
        assert_eq!(
            map_workout_measurement("Tabata Scoring:"),
            WorkoutMeasurement::Tabata
        );
        assert_eq!(
            map_workout_measurement("Total Score:"),
            WorkoutMeasurement::Total
        );
        assert_eq!(
            map_workout_measurement("No Score:"),
            WorkoutMeasurement::None
        );
        assert_eq!(
            map_workout_measurement("Invalid:"),
            WorkoutMeasurement::None
        );
    }

    #[test]
    fn test_map_movement_measurement() {
        assert_eq!(map_movement_measurement(0), MovementMeasurement::Weight);
        assert_eq!(map_movement_measurement(1), MovementMeasurement::Distance);
        assert_eq!(map_movement_measurement(2), MovementMeasurement::Reps);
        assert_eq!(map_movement_measurement(3), MovementMeasurement::Height);
        assert_eq!(map_movement_measurement(4), MovementMeasurement::None);
    }

    #[test]
    fn test_parse_short_date() {
        let res = parse_short_date("1991-12-06");
        assert_eq!(res, "1991-12-06T00:00:00+00:00");
    }

    #[test]
    fn test_adjust_movement_score_to_measurement_weight() {
        let score = MovementSession {
            foreign_movement_client_id: "initial".to_string(),
            foreign_movement_record_id: 12,
            measurement_a_value: 70f64,
            measurement_a_units_code: 1,
            measurement_b: 1.to_string(),
            sets: 1.to_string(),
            notes: "back squat".to_string(),
            date: "2012-10-10".to_owned(),
        };
        let res =
            adjust_movement_score_to_measurement(&MovementMeasurement::Weight, &score).unwrap();
        assert_eq!(res.score, "70");
        assert_eq!(res.sets, 1);
        assert_eq!(res.reps, 1);
        assert_eq!(res.distance, "");
        assert_eq!(res.notes, "back squat");
        assert_eq!(res.created_at.unwrap(), "2012-10-10T00:00:00+00:00");
    }

    #[test]
    fn test_adjust_movement_score_to_measurement_height() {
        let score = MovementSession {
            foreign_movement_client_id: "initial".to_string(),
            foreign_movement_record_id: 13,
            measurement_a_value: 126f64,
            measurement_a_units_code: 1,
            measurement_b: 1.to_string(),
            sets: 1.to_string(),
            notes: "box jumps".to_string(),
            date: "2012-10-11".to_owned(),
        };
        let res =
            adjust_movement_score_to_measurement(&MovementMeasurement::Height, &score).unwrap();
        assert_eq!(res.score, "126");
        assert_eq!(res.sets, 1);
        assert_eq!(res.reps, 1);
        assert_eq!(res.distance, "");
        assert_eq!(res.notes, "box jumps");
        assert_eq!(res.created_at.unwrap(), "2012-10-11T00:00:00+00:00");
    }

    #[test]
    fn test_adjust_movement_score_to_measurement_distance() {
        let score = MovementSession {
            foreign_movement_client_id: "initial".to_string(),
            foreign_movement_record_id: 14,
            measurement_a_value: 1000f64,
            measurement_a_units_code: 1,
            measurement_b: "2:50".to_string(),
            sets: 1.to_string(),
            notes: "rowing".to_string(),
            date: "2012-10-12".to_owned(),
        };
        let res =
            adjust_movement_score_to_measurement(&MovementMeasurement::Distance, &score).unwrap();
        assert_eq!(res.score, "2:50");
        assert_eq!(res.sets, 1);
        assert_eq!(res.reps, 1);
        assert_eq!(res.distance, "1000");
        assert_eq!(res.notes, "rowing");
        assert_eq!(res.created_at.unwrap(), "2012-10-12T00:00:00+00:00");
    }

    #[test]
    fn test_adjust_movement_score_to_measurement_reps() {
        let score = MovementSession {
            foreign_movement_client_id: "initial".to_string(),
            foreign_movement_record_id: 15,
            measurement_a_value: 7f64,
            measurement_a_units_code: 1,
            measurement_b: "".to_string(),
            sets: 1.to_string(),
            notes: "hspu".to_string(),
            date: "2012-10-13".to_owned(),
        };
        let res = adjust_movement_score_to_measurement(&MovementMeasurement::Reps, &score).unwrap();
        assert_eq!(res.score, "");
        assert_eq!(res.sets, 1);
        assert_eq!(res.reps, 7);
        assert_eq!(res.distance, "");
        assert_eq!(res.notes, "hspu");
        assert_eq!(res.created_at.unwrap(), "2012-10-13T00:00:00+00:00");
    }

    #[test]
    fn test_adjust_movement_score_to_measurement_invalid_score_type() {
        let score = MovementSession {
            foreign_movement_client_id: "".to_string(),
            foreign_movement_record_id: 0,
            measurement_a_value: 0f64,
            measurement_a_units_code: 1,
            measurement_b: "".to_string(),
            sets: 1.to_string(),
            notes: "hspu".to_string(),
            date: "2012-10-13".to_owned(),
        };
        let res = adjust_movement_score_to_measurement(&MovementMeasurement::None, &score);
        assert!(res.is_none());
    }

    #[test]
    fn test_parse_workout() {
        let score = MyWOD {
            title: "181017".to_owned(),
            date: "2017-11-18".to_owned(),
            score_type: "For Time:".to_owned(),
            score: "14:20".to_owned(),
            as_prescribed: 1,
            description: "5 rounds:\n15 ft rope climb, 3 ascents,\n10 toes-to-bar,\n21 walking lunges with 20.4/13.6kg plate overhead,\n400 meter run".to_owned(),
            notes: "".to_owned(),
        };

        let res = parse_workout_score(&score);
        assert_eq!(res.score, "14:20");
        assert_eq!(res.rx, true);
        assert_eq!(res.notes, "");
        assert_eq!(res.created_at.unwrap(), "2017-11-18T00:00:00+00:00");
    }

    #[test]
    fn test_get_scores_for_movement() {
        let movement = Movement {
            primary_client_id: "i-1fa65b03fbd343ef86270ad1bad1c369-2017-01-02 17:32:34 +0000"
                .to_owned(),
            primary_record_id: 5,
            name: "HSPU".to_owned(),
            score_type: 2,
        };

        let movement_scores: Vec<MovementSession> = vec![
            MovementSession {
                foreign_movement_client_id:
                    "i-1fa65b03fbd343ef86270ad1bad1c369-2017-01-02 17:32:34 +0000".to_owned(),
                foreign_movement_record_id: 5,
                date: "2017-11-07".to_owned(),
                measurement_a_value: 7 as f64,
                measurement_a_units_code: 8,
                measurement_b: "".to_owned(),
                sets: 1.to_string(),
                notes: "HSPU score".to_owned(),
            },
            MovementSession {
                foreign_movement_client_id: "initial".to_owned(),
                foreign_movement_record_id: 3,
                date: "2017-04-11".to_owned(),
                measurement_a_value: 70 as f64,
                measurement_a_units_code: 1,
                measurement_b: "1".to_owned(),
                sets: 1.to_string(),
                notes: "".to_owned(),
            },
        ];

        let res = get_scores_for_movement(&movement, &movement_scores);
        assert_eq!(res.len(), 1);
        let my_score: &CreateMovementScore = res.get(0).unwrap();
        assert_eq!(&my_score.notes, "HSPU score");
    }
}
