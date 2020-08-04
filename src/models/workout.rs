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

#[derive(Serialize, Deserialize, Debug, PartialEq)]
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
impl WorkoutMeasurement {
    pub fn to_string(&self) -> String {
        let string_val = serde_json::to_string(self).unwrap_or("none".to_owned());
        string_val.trim_matches('"').to_owned()
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WorkoutModel {
    pub workout_id: String,
    pub user_id: String,
    pub name: String,
    pub measurement: WorkoutMeasurement,
    pub description: String,
    pub public: bool,
    pub created_at: String,
    pub updated_at: String,
}

impl WorkoutModel {
    pub fn to_doc(&self) -> Document {
        doc! {
            "workout_id": self.workout_id.to_owned(),
            "user_id": self.user_id.to_owned(),
            "name": self.name.to_owned(),
            "measurement": self.measurement.to_string(),
            "description": self.description.to_owned(),
            "public": self.public,
            "created_at": self.created_at.to_owned(),
            "updated_at": self.updated_at.to_owned(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WorkoutResponse {
    pub workout_id: String,
    pub name: String,
    pub measurement: WorkoutMeasurement,
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
    pub measurement: WorkoutMeasurement,
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
    pub user_id: String,
    pub score: String,
    pub rx: bool,
    pub notes: String,
    pub created_at: String,
    pub updated_at: String,
}

impl WorkoutScoreResponse {
    pub fn to_doc(&self) -> Document {
        doc! {
            "workout_score_id": self.workout_score_id.to_owned(),
            "workout_id": self.workout_id.to_owned(),
            "user_id": self.user_id.to_owned(),
            "score": self.score.to_owned(),
            "rx": self.rx.to_owned(),
            "notes": self.notes.to_owned(),
            "created_at": self.created_at.to_owned(),
            "updated_at": self.updated_at.to_owned(),
        }
    }
}
