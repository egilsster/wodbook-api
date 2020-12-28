use crate::models::{movement::MovementScoreModel, workout::WorkoutScoreModel};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct HealthResponse {
    pub status: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TokenResponse {
    pub token: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UserResponse {
    pub user_id: String,
    pub email: String,
    pub first_name: String,
    pub last_name: String,
    pub date_of_birth: String,
    pub height: i32,
    pub weight: i32,
    pub box_name: String,
    pub avatar_url: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UserScoreResponse {
    pub movement_scores: Vec<MovementScoreModel>,
    pub workout_scores: Vec<WorkoutScoreModel>,
}
