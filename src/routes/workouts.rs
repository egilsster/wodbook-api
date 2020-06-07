use crate::errors::AppError;
use crate::models::user::Claims;
use crate::models::workout::{
    CreateWorkout, CreateWorkoutScore, ManyWorkoutsResponse, UpdateWorkout, WorkoutResponse,
};
use crate::repositories::workout_repository::{WorkoutRepository, WorkoutScoreRepository};
use crate::utils::AppState;
use actix_web::{get, patch, post, web, HttpResponse, Responder};
use slog::{info, o};

#[get("/")]
async fn get_workouts(
    state: web::Data<AppState>,
    claims: Claims,
) -> Result<impl Responder, AppError> {
    let logger = state.logger.new(o!("handler" => "GET /workouts"));
    info!(logger, "Getting all workouts");
    let workout_repo = WorkoutRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let user_id = claims.user_id.to_owned();
    let result = workout_repo.get_workouts(user_id).await;

    result.map(|workouts| HttpResponse::Ok().json(ManyWorkoutsResponse { data: workouts }))
}

#[post("/")]
async fn create_workout(
    state: web::Data<AppState>,
    claims: Claims,
    workout: web::Json<CreateWorkout>,
) -> Result<impl Responder, AppError> {
    let logger = state.logger.new(o!("handler" => "POST /workouts"));
    info!(logger, "Creating a new workout");
    let workout_repo = WorkoutRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let user_id = claims.user_id.to_owned();
    let result = workout_repo
        .create_workout(user_id, workout.into_inner())
        .await;

    result.map(|workout| HttpResponse::Created().json(workout))
}

#[patch("/{id}")]
async fn update_workout(
    state: web::Data<AppState>,
    info: web::Path<String>,
    claims: Claims,
    workout: web::Json<UpdateWorkout>,
) -> Result<impl Responder, AppError> {
    let workout_id = info.to_owned();
    let logger = state
        .logger
        .new(o!("handler" => format!("PATCH /workouts/{}", workout_id.to_owned())));
    info!(logger, "Creating a new workout");
    let workout_repo = WorkoutRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let user_id = claims.user_id.to_owned();
    let result = workout_repo
        .update_workout(user_id, workout_id, workout.into_inner())
        .await;

    result.map(|workout| HttpResponse::Ok().json(workout))
}

#[get("/{id}")]
async fn get_workout_by_id(
    state: web::Data<AppState>,
    info: web::Path<String>,
    claims: Claims,
) -> Result<impl Responder, AppError> {
    let workout_id = info.to_owned();
    let logger = state
        .logger
        .new(o!("handler" => format!("GET /workouts/{}", workout_id.to_owned())));
    info!(logger, "Getting workout by id");

    let workout_repo = WorkoutRepository {
        mongo_client: state.mongo_client.clone(),
    };
    let score_repo = WorkoutScoreRepository {
        mongo_client: state.mongo_client.clone(),
    };

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
    state: web::Data<AppState>,
    info: web::Path<String>,
    claims: Claims,
    workout_score: web::Json<CreateWorkoutScore>,
) -> Result<impl Responder, AppError> {
    let workout_id = info.to_owned();
    let logger = state
        .logger
        .new(o!("handler" => format!("POST /workouts/{}", workout_id.to_owned())));
    info!(logger, "Creating workout score");

    let score_repo = WorkoutScoreRepository {
        mongo_client: state.mongo_client.clone(),
    };

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
    cfg.service(update_workout);
    cfg.service(get_workout_by_id);
    cfg.service(create_workout_score);
}
