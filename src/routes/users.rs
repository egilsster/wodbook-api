use crate::errors::AppError;
use crate::models::mywod::MyWodResponse;
use crate::models::response::{TokenResponse, UserScoreResponse};
use crate::models::user::Claims;
use crate::models::user::{CreateUser, Login, UpdateUser};
use crate::repositories::{MovementRepository, UserRepository, WorkoutRepository};
use crate::services::mywod;
use crate::utils::mywod::{delete_payload_file, read_contents, write_payload_to_file};
use crate::utils::AppState;
use actix_multipart::Multipart;
use actix_web::{get, patch, post, web, HttpResponse, Responder};

#[post("/login")]
async fn login(
    state: web::Data<AppState>,
    user: web::Json<Login>,
) -> Result<impl Responder, AppError> {
    let user_repo = UserRepository {
        mongo_client: state.mongo_client.clone(),
    };

    user_repo
        .login(user.into_inner())
        .await
        .map(|token| HttpResponse::Ok().json(TokenResponse { token }))
}

#[post("/register")]
async fn register(
    state: web::Data<AppState>,
    user: web::Json<CreateUser>,
) -> Result<impl Responder, AppError> {
    let user_repo = UserRepository {
        mongo_client: state.mongo_client.clone(),
    };

    user_repo
        .register(user.into_inner())
        .await
        .map(|token| HttpResponse::Created().json(TokenResponse { token }))
}

#[get("/me")]
async fn get_user_information(
    state: web::Data<AppState>,
    claims: Claims,
) -> Result<impl Responder, AppError> {
    let user_repo = UserRepository {
        mongo_client: state.mongo_client.clone(),
    };

    user_repo
        .find_user_with_email(claims.sub.as_ref())
        .await
        .map(|user_scores| HttpResponse::Ok().json(user_scores))
}

#[get("/me/scores")]
async fn get_user_scores(
    state: web::Data<AppState>,
    claims: Claims,
) -> Result<impl Responder, AppError> {
    let movement_repo = MovementRepository {
        mongo_client: state.mongo_client.clone(),
    };
    let movement_scores = movement_repo
        .get_movement_scores_for_user(claims.user_id.as_ref())
        .await?;

    let workout_repo = WorkoutRepository {
        mongo_client: state.mongo_client.clone(),
    };
    let workout_scores = workout_repo
        .get_workout_scores_for_user(claims.user_id.as_ref())
        .await?;

    Ok(HttpResponse::Ok().json(UserScoreResponse {
        movement_scores,
        workout_scores,
    }))
}

#[patch("/me")]
async fn update_user_information(
    state: web::Data<AppState>,
    claims: Claims,
    user: web::Json<UpdateUser>,
) -> Result<impl Responder, AppError> {
    let user_repo = UserRepository {
        mongo_client: state.mongo_client.clone(),
    };

    user_repo
        .update_user_with_email(claims.sub.as_ref(), user.into_inner())
        .await
        .map(|user| HttpResponse::Ok().json(user))
}

#[post("/mywod")]
async fn sync_mywod(
    state: web::Data<AppState>,
    claims: Claims,
    payload: Multipart,
) -> Result<impl Responder, AppError> {
    let user_id = claims.user_id.as_ref();
    let user_email = claims.sub.as_ref();
    let user_repo = UserRepository {
        mongo_client: state.mongo_client.clone(),
    };
    let workout_repo = WorkoutRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let written_filename = write_payload_to_file(payload).await?;
    info!("File written: {}", written_filename);

    let mywod_data = read_contents(&written_filename).await;

    let deleted = delete_payload_file(written_filename).await?;
    info!("File deleted after handling: {}", deleted);

    let mywod_data = mywod_data?;

    let user_updated =
        mywod::save_athlete(user_repo, user_id, user_email, mywod_data.athlete).await?;
    let added_workouts_and_scores = mywod::save_workouts_and_scores(
        workout_repo,
        mywod_data.workouts,
        &mywod_data.workout_scores,
        user_id,
    )
    .await?;

    let movement_repo = MovementRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let added_movements_and_scores = mywod::save_movements_and_scores(
        movement_repo,
        &mywod_data.movements,
        &mywod_data.movement_scores,
        user_id,
    )
    .await?;

    Ok(HttpResponse::Ok().json(MyWodResponse {
        user_updated,
        added_workouts: added_workouts_and_scores.0,
        added_workout_scores: added_workouts_and_scores.1,
        added_movements: added_movements_and_scores.0,
        added_movement_scores: added_movements_and_scores.1,
    }))
}

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(login);
    cfg.service(register);
    cfg.service(get_user_information);
    cfg.service(get_user_scores);
    cfg.service(update_user_information);
    cfg.service(sync_mywod);
}
