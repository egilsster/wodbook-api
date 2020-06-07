use serde::{Deserialize, Serialize};
use std::vec::Vec;

// https://github.com/serde-rs/serde/issues/1030#issuecomment-522278006
fn default_as_false() -> bool {
    false
}

fn default_as_empty_string() -> String {
    "".to_string()
}

fn default_as_one() -> u32 {
    1
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MovementModel {
    pub movement_id: String,
    pub name: String,
    pub measurement: String,
    pub global: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MovementResponse {
    pub movement_id: String,
    pub name: String,
    pub measurement: String,
    pub scores: Vec<MovementScoreResponse>,
    pub global: bool,
    pub created_at: String,
    pub updated_at: String,
}

impl MovementResponse {
    pub fn from_model(model: MovementModel, scores: Vec<MovementScoreResponse>) -> Self {
        MovementResponse {
            movement_id: model.movement_id,
            name: model.name,
            measurement: model.measurement,
            scores,
            global: model.global,
            created_at: model.created_at,
            updated_at: model.updated_at,
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ManyMovementsResponse {
    pub data: Vec<MovementModel>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ManyMovementScoresResponse {
    pub data: Vec<MovementScoreResponse>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateMovement {
    pub name: String,
    pub measurement: String,
    #[serde(default = "default_as_false")]
    pub global: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateMovement {
    pub name: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateMovementScore {
    pub score: String,
    #[serde(default = "default_as_one")]
    pub sets: u32,
    #[serde(default = "default_as_one")]
    pub reps: u32,
    #[serde(default = "default_as_empty_string")]
    pub distance: String,
    #[serde(default = "default_as_empty_string")]
    pub notes: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MovementScoreResponse {
    pub movement_score_id: String,
    pub movement_id: String,
    pub score: String,
    pub sets: u32,
    pub reps: u32,
    pub distance: String,
    pub notes: String,
    pub created_at: String,
    pub updated_at: String,
}
