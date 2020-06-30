use bson::Document;
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
    pub public: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MovementResponse {
    pub movement_id: String,
    pub name: String,
    pub measurement: String,
    pub scores: Vec<MovementScoreResponse>,
    pub public: bool,
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
            public: model.public,
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
    pub public: bool,
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
    pub created_at: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateMovementScore {
    pub score: Option<String>,
    pub sets: Option<u32>,
    pub reps: Option<u32>,
    pub distance: Option<String>,
    pub notes: Option<String>,
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

impl MovementScoreResponse {
    pub fn to_doc(&self, user_id: &str) -> Document {
        doc! {
            "movement_score_id": self.movement_score_id.to_owned(),
            "movement_id": self.movement_id.to_owned(),
            "user_id": user_id.to_owned(),
            "score": self.score.to_owned(),
            "sets": self.sets.to_owned(),
            "reps": self.reps.to_owned(),
            "distance": self.distance.to_owned(),
            "notes": self.notes.to_owned(),
            "created_at": self.created_at.to_owned(),
            "updated_at": self.updated_at.to_owned(),
        }
    }
}
