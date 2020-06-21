use bson::{doc, Document};
use serde::{Deserialize, Serialize};
use std::vec::Vec;

// https://github.com/serde-rs/serde/issues/1030#issuecomment-522278006
fn default_as_false() -> bool {
    false
}

fn default_as_empty_string() -> String {
    "".to_string()
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WorkoutModel {
    pub workout_id: String,
    pub name: String,
    pub measurement: String,
    pub description: String,
    pub public: bool,
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
    pub public: bool,
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
            scores,
            public: model.public,
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
    pub public: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateWorkout {
    pub name: Option<String>,
    pub description: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateWorkoutScore {
    pub score: String,
    #[serde(default = "default_as_false")]
    pub rx: bool,
    #[serde(default = "default_as_empty_string")]
    pub notes: String,
    pub created_at: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateWorkoutScore {
    pub score: Option<String>,
    pub rx: Option<bool>,
    pub notes: Option<String>,
    pub created_at: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WorkoutScoreResponse {
    pub workout_score_id: String,
    pub workout_id: String,
    pub score: String,
    pub rx: bool,
    pub notes: String,
    pub created_at: String,
    pub updated_at: String,
}

impl WorkoutScoreResponse {
    pub fn to_doc(&self, user_id: &str) -> Document {
        doc! {
            "workout_score_id": self.workout_score_id.to_owned(),
            "workout_id": self.workout_id.to_owned(),
            "user_id": user_id.to_owned(),
            "score": self.score.to_owned(),
            "rx": self.rx.to_owned(),
            "notes": self.notes.to_owned(),
            "created_at": self.created_at.to_owned(),
            "updated_at": self.updated_at.to_owned(),
        }
    }
}
