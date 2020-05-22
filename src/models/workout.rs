use serde::{Deserialize, Serialize};
use std::vec::Vec;

// https://github.com/serde-rs/serde/issues/1030#issuecomment-522278006
fn default_as_false() -> bool {
    false
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WorkoutModel {
    pub workout_id: String,
    pub name: String,
    pub measurement: String,
    pub description: String,
    pub global: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WorkoutResponse {
    pub workout_id: String,
    pub name: String,
    pub measurement: String,
    pub description: String,
    pub scores: Vec<WorkoutScoreResponse>,
    pub global: bool,
    pub created_at: String,
    pub updated_at: String,
}

impl WorkoutResponse {
    pub fn from_model(model: WorkoutModel, scores: Vec<WorkoutScoreResponse>) -> Self {
        WorkoutResponse {
            workout_id: model.workout_id,
            name: model.name,
            measurement: model.measurement,
            description: model.description,
            scores: scores,
            global: model.global,
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
    pub data: Vec<WorkoutScoreResponse>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateWorkout {
    pub name: String,
    pub description: String,
    pub measurement: String,
    #[serde(default = "default_as_false")]
    pub global: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateWorkoutScore {
    pub score: String,
    pub rx: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WorkoutScoreResponse {
    pub workout_score_id: String,
    pub workout_id: String,
    pub score: String,
    pub rx: bool,
    pub created_at: String,
    pub updated_at: String,
}
