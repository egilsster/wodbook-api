use serde::{Deserialize, Serialize};
use std::fmt;
use std::vec::Vec;

// https://github.com/serde-rs/serde/issues/1030#issuecomment-522278006
fn default_as_false() -> bool {
    false
}

fn default_as_empty_string() -> String {
    "".to_string()
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone, Copy)]
#[serde(rename_all = "snake_case")]
pub enum WorkoutMeasurement {
    Time,
    Distance,
    Load,
    Repetitions,
    Rounds,
    TimedRounds,
    Tabata,
    Total,
    Unknown,
    None,
}

// TODO: Find a nicer way of serializing into strings without the quotes
impl fmt::Display for WorkoutMeasurement {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let string_val = serde_json::to_string(self).unwrap_or_else(|_| "none".to_owned());
        write!(f, "{}", string_val.trim_matches('"'))
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WorkoutModel {
    pub workout_id: String,
    pub user_id: String,
    pub name: String,
    pub measurement: WorkoutMeasurement,
    pub description: String,
    pub is_public: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WorkoutResponse {
    pub workout_id: String,
    pub name: String,
    pub measurement: WorkoutMeasurement,
    pub description: String,
    pub scores: Vec<WorkoutScoreModel>,
    pub is_public: bool,
    pub created_at: String,
    pub updated_at: String,
}

impl WorkoutResponse {
    pub fn from_model(model: WorkoutModel, scores: Vec<WorkoutScoreModel>) -> Self {
        WorkoutResponse {
            workout_id: model.workout_id,
            name: model.name,
            measurement: model.measurement,
            description: model.description,
            scores,
            is_public: model.is_public,
            created_at: model.created_at,
            updated_at: model.updated_at,
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ManyWorkoutsResponse {
    pub data: Vec<WorkoutModel>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ManyWorkoutScoresResponse {
    pub data: Vec<WorkoutScoreModel>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateWorkout {
    pub name: String,
    pub description: String,
    pub measurement: WorkoutMeasurement,
    #[serde(default = "default_as_false")]
    pub is_public: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateWorkout {
    pub name: Option<String>,
    pub description: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateWorkoutScore {
    pub score: f64,
    #[serde(default = "default_as_false")]
    pub rx: bool,
    #[serde(default = "default_as_empty_string")]
    pub notes: String,
    pub created_at: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateWorkoutScore {
    pub score: Option<f64>,
    pub rx: Option<bool>,
    pub notes: Option<String>,
    pub created_at: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WorkoutScoreModel {
    pub workout_score_id: String,
    pub workout_id: String,
    pub user_id: String,
    pub score: f64,
    pub rx: bool,
    pub notes: String,
    pub created_at: String,
    pub updated_at: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_measurement_to_string() {
        assert_eq!(WorkoutMeasurement::Time.to_string(), "time");
        assert_eq!(WorkoutMeasurement::Distance.to_string(), "distance");
        assert_eq!(WorkoutMeasurement::Load.to_string(), "load");
        assert_eq!(WorkoutMeasurement::Repetitions.to_string(), "repetitions");
        assert_eq!(WorkoutMeasurement::Rounds.to_string(), "rounds");
        assert_eq!(WorkoutMeasurement::TimedRounds.to_string(), "timed_rounds");
        assert_eq!(WorkoutMeasurement::Tabata.to_string(), "tabata");
        assert_eq!(WorkoutMeasurement::Total.to_string(), "total");
        assert_eq!(WorkoutMeasurement::Unknown.to_string(), "unknown");
        assert_eq!(WorkoutMeasurement::None.to_string(), "none");
    }
}
