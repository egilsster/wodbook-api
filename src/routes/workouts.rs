use crate::errors::AppError;
use crate::models::user::Claims;
use crate::models::workout::{
    CreateWorkout, CreateWorkoutScore, ManyWorkoutsResponse, UpdateWorkout, UpdateWorkoutScore,
    WorkoutResponse,
};
use crate::repositories::WorkoutRepository;
use crate::utils::AppState;
use actix_web::{delete, get, patch, post, web, HttpResponse, Responder};

#[get("")]
async fn get_workouts(
    state: web::Data<AppState>,
    claims: Claims,
) -> Result<impl Responder, AppError> {
    let workout_repo = WorkoutRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let user_id = claims.user_id.as_ref();
    let result = workout_repo.get_workouts(user_id).await;

    result.map(|workouts| HttpResponse::Ok().json(ManyWorkoutsResponse { data: workouts }))
}

#[post("")]
async fn create_workout(
    state: web::Data<AppState>,
    claims: Claims,
    workout: web::Json<CreateWorkout>,
) -> Result<impl Responder, AppError> {
    let workout_repo = WorkoutRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let user_id = claims.user_id.as_ref();
    let result = workout_repo
        .create_workout(&user_id, workout.into_inner())
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
    let workout_id = info;
    let workout_repo = WorkoutRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let user_id = claims.user_id.as_ref();
    let result = workout_repo
        .update_workout(user_id, &workout_id, workout.into_inner())
        .await;

    result.map(|workout| HttpResponse::Ok().json(workout))
}

#[delete("/{id}")]
async fn delete_workout(
    state: web::Data<AppState>,
    info: web::Path<String>,
    claims: Claims,
) -> Result<impl Responder, AppError> {
    let workout_id = info;
    let workout_repo = WorkoutRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let user_id = claims.user_id.as_ref();
    let result = workout_repo.delete_workout(user_id, &workout_id).await;

    result.map(|_| HttpResponse::NoContent())
}

#[get("/{id}")]
async fn get_workout_by_id(
    state: web::Data<AppState>,
    info: web::Path<String>,
    claims: Claims,
) -> Result<impl Responder, AppError> {
    let workout_id = info;
    let workout_repo = WorkoutRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let user_id = claims.user_id.as_ref();
    let workout_result = workout_repo.get_workout_by_id(user_id, &workout_id).await;
    let scores_result = workout_repo
        .get_workout_scores_for_workout(user_id, &workout_id)
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
    let workout_id = info;
    let workout_repo = WorkoutRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let user_id = claims.user_id.as_ref();
    let scores_result = workout_repo
        .create_workout_score(user_id, &workout_id, workout_score.into_inner())
        .await;

    scores_result.map(|score| HttpResponse::Created().json(score))
}

#[patch("/{workout_id}/{score_id}")]
async fn update_workout_score(
    state: web::Data<AppState>,
    web::Path((workout_id, score_id)): web::Path<(String, String)>,
    claims: Claims,
    workout_score_update: web::Json<UpdateWorkoutScore>,
) -> Result<impl Responder, AppError> {
    let workout_repo = WorkoutRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let user_id = claims.user_id.as_ref();
    let scores_result = workout_repo
        .update_workout_score_by_id(
            user_id,
            &workout_id,
            &score_id,
            workout_score_update.into_inner(),
        )
        .await;

    scores_result.map(|score| HttpResponse::Ok().json(score))
}

#[delete("/{workout_id}/{score_id}")]
async fn delete_workout_score(
    state: web::Data<AppState>,
    web::Path((workout_id, score_id)): web::Path<(String, String)>,
    claims: Claims,
) -> Result<impl Responder, AppError> {
    let workout_repo = WorkoutRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let user_id = claims.user_id.as_ref();
    let result = workout_repo
        .delete_workout_score_by_id(user_id, &workout_id, &score_id)
        .await;

    result.map(|_| HttpResponse::NoContent())
}

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_workouts);
    cfg.service(create_workout);
    cfg.service(update_workout);
    cfg.service(delete_workout);
    cfg.service(get_workout_by_id);
    cfg.service(create_workout_score);
    cfg.service(update_workout_score);
    cfg.service(delete_workout_score);
}
