// use rusqlite::blob::ZeroBlob;
use serde::Serialize;

#[derive(Debug)]
pub struct Athlete {
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub height: i32,
    pub weight: i32,
    pub date_of_birth: String,
    pub box_name: String,
    // pub avatar: ZeroBlob,
}

#[derive(Debug)]
pub struct CustomWOD {
    pub title: String,
    pub score_type: String,
    pub description: String,
}

#[derive(Debug)]
pub struct MyWOD {
    pub title: String,
    pub date: String,
    pub score_type: String,
    pub score: String,
    pub as_prescribed: i32, // 0 or 1
    pub description: String,
    pub notes: String,
}

#[derive(Debug)]
pub struct Movement {
    pub primary_client_id: String,
    pub primary_record_id: i32,
    pub name: String,
    pub score_type: i32, // 0, 1, 2, 3
}

#[derive(Debug)]
pub struct MovementSession {
    pub foreign_movement_client_id: String,
    pub foreign_movement_record_id: i32, // primary key of movement
    pub date: String,
    pub measurement_a_value: f64,
    pub measurement_a_units_code: u32,
    pub measurement_b: String,
    pub sets: String,
    pub notes: String,
}

pub struct MyWodData {
    pub athlete: Athlete,
    pub workouts: Vec<CustomWOD>,
    pub movements: Vec<Movement>,
    pub movement_scores: Vec<MovementSession>,
    pub workout_scores: Vec<MyWOD>,
}

#[derive(Serialize, Debug)]
pub struct MyWodResponse {
    pub user_updated: bool,
    pub added_workouts: u32,
    pub added_workout_scores: u32,
    pub added_movements: u32,
    pub added_movement_scores: u32,
}
