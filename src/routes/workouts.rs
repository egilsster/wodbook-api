use crate::db::connection::Connection;
use crate::errors::AppError;
use crate::models::user::Claims;
use crate::models::workout::{
    CreateWorkout, CreateWorkoutScore, ManyWorkoutsResponse, WorkoutResponse,
};
use crate::repositories::workout_repository::{WorkoutRepository, WorkoutScoreRepository};
use actix_web::{get, post, web, HttpResponse, Responder};

#[get("/")]
async fn get_workouts(claims: Claims) -> Result<impl Responder, AppError> {
    let connection = Connection.init().await.unwrap();
    let workout_repo = WorkoutRepository { connection };

    let user_id = claims.user_id.to_owned();
    let result = workout_repo.get_workouts(user_id).await;

    result.map(|workouts| HttpResponse::Ok().json(ManyWorkoutsResponse { data: workouts }))
}

#[post("/")]
async fn create_workout(
    claims: Claims,
    workout: web::Json<CreateWorkout>,
) -> Result<impl Responder, AppError> {
    let connection = Connection.init().await.unwrap();
    let workout_repo = WorkoutRepository { connection };
    let user_id = claims.user_id.to_owned();
    let result = workout_repo
        .create_workout(user_id, workout.into_inner())
        .await;

    result.map(|workout| HttpResponse::Created().json(workout))
}

#[get("/{id}")]
async fn get_workout_by_id(
    info: web::Path<String>,
    claims: Claims,
) -> Result<impl Responder, AppError> {
    let connection = Connection.init().await.unwrap();
    let workout_repo = WorkoutRepository { connection };
    let connection = Connection.init().await.unwrap();
    let score_repo = WorkoutScoreRepository { connection };

    let workout_id = info.to_owned();
    let user_id = claims.user_id.to_owned();
    let workout_result = workout_repo
        .get_workout_by_id(user_id.to_owned(), workout_id.to_owned())
        .await;
    let scores_result = score_repo
        .get_workout_scores(user_id.to_owned(), workout_id.to_owned())
        .await;

    workout_result.map(|workout| {
        scores_result
            .map(|scores| HttpResponse::Ok().json(WorkoutResponse::from_model(workout, scores)))
    })
}

#[post("/{id}")]
async fn create_workout_score(
    info: web::Path<String>,
    claims: Claims,
    workout_score: web::Json<CreateWorkoutScore>,
) -> Result<impl Responder, AppError> {
    let connection = Connection.init().await.unwrap();
    let score_repo = WorkoutScoreRepository { connection };

    let workout_id = info.to_owned();
    let user_id = claims.user_id.to_owned();
    let scores_result = score_repo
        .create_workout_score(user_id, workout_id, workout_score.into_inner())
        .await;

    scores_result.map(|score| HttpResponse::Created().json(score))
}

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_workouts);
    cfg.service(create_workout);
    cfg.service(get_workout_by_id);
    cfg.service(create_workout_score);
}
