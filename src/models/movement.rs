use bson::Document;
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

fn default_as_one() -> u32 {
    1
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum MovementMeasurement {
    Time, // fka Distance
    Weight,
    Reps,
    Height,
    None,
}

// TODO: Find a nicer way of serializing into strings without the quotes
impl fmt::Display for MovementMeasurement {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let string_val = serde_json::to_string(self).unwrap_or_else(|_| "none".to_owned());
        write!(f, "{}", string_val.trim_matches('"'))
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MovementModel {
    pub movement_id: String,
    pub user_id: String,
    pub name: String,
    pub measurement: MovementMeasurement,
    pub is_public: bool,
    pub created_at: String,
    pub updated_at: String,
}

impl MovementModel {
    pub fn to_doc(&self) -> Document {
        doc! {
            "movement_id": self.movement_id.to_owned(),
            "user_id": self.user_id.to_owned(),
            "name": self.name.to_owned(),
            "measurement": self.measurement.to_string().to_lowercase(),
            "is_public": self.is_public,
            "created_at": self.created_at.to_owned(),
            "updated_at": self.updated_at.to_owned(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MovementResponse {
    pub movement_id: String,
    pub name: String,
    pub measurement: MovementMeasurement,
    pub scores: Vec<MovementScoreResponse>,
    pub is_public: bool,
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
            is_public: model.is_public,
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
    pub measurement: MovementMeasurement,
    #[serde(default = "default_as_false")]
    pub is_public: bool,
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
    pub notes: String,
    pub created_at: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateMovementScore {
    pub score: Option<String>,
    pub sets: Option<u32>,
    pub reps: Option<u32>,
    pub notes: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MovementScoreResponse {
    pub movement_score_id: String,
    pub movement_id: String,
    pub user_id: String,
    pub score: String,
    pub sets: u32,
    pub reps: u32,
    pub notes: String,
    pub created_at: String,
    pub updated_at: String,
}

impl MovementScoreResponse {
    pub fn to_doc(&self) -> Document {
        doc! {
            "movement_score_id": self.movement_score_id.to_owned(),
            "movement_id": self.movement_id.to_owned(),
            "user_id": self.user_id.to_owned(),
            "score": self.score.to_owned(),
            "sets": self.sets.to_owned(),
            "reps": self.reps.to_owned(),
            "notes": self.notes.to_owned(),
            "created_at": self.created_at.to_owned(),
            "updated_at": self.updated_at.to_owned(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_measurement_to_string() {
        assert_eq!(MovementMeasurement::Time.to_string(), "time");
        assert_eq!(MovementMeasurement::Weight.to_string(), "weight");
        assert_eq!(MovementMeasurement::Reps.to_string(), "reps");
        assert_eq!(MovementMeasurement::Height.to_string(), "height");
        assert_eq!(MovementMeasurement::None.to_string(), "none");
    }
}
