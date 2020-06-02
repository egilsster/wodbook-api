use crate::errors::AppError;
use crate::models::movement::{
    CreateMovement, CreateMovementScore, ManyMovementsResponse, MovementResponse,
};
use crate::models::user::Claims;
use crate::repositories::movement_repository::{MovementRepository, MovementScoreRepository};
use crate::utils::AppState;
use actix_web::{get, post, web, HttpResponse, Responder};
use slog::{info, o};

#[get("/")]
async fn get_movements(
    state: web::Data<AppState>,
    claims: Claims,
) -> Result<impl Responder, AppError> {
    let logger = state.logger.new(o!("handler" => "GET /movements"));
    info!(logger, "Getting all movements");
    let movement_repo = MovementRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let user_id = claims.user_id.to_owned();
    let result = movement_repo.get_movements(user_id).await;

    result.map(|movements| HttpResponse::Ok().json(ManyMovementsResponse { data: movements }))
}

#[post("/")]
async fn create_movement(
    state: web::Data<AppState>,
    claims: Claims,
    movement: web::Json<CreateMovement>,
) -> Result<impl Responder, AppError> {
    let logger = state.logger.new(o!("handler" => "POST /movements"));
    info!(logger, "Creating a new movement");
    let movement_repo = MovementRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let user_id = claims.user_id.to_owned();
    let result = movement_repo
        .create_movement(user_id, movement.into_inner())
        .await;

    result.map(|movement| HttpResponse::Created().json(movement))
}

#[get("/{id}")]
async fn get_movement_by_id(
    state: web::Data<AppState>,
    info: web::Path<String>,
    claims: Claims,
) -> Result<impl Responder, AppError> {
    let movement_id = info.to_owned();
    let logger = state
        .logger
        .new(o!("handler" => format!("GET /movements/{}", movement_id.to_owned())));
    info!(logger, "Getting movement by id");

    let movement_repo = MovementRepository {
        mongo_client: state.mongo_client.clone(),
    };
    let score_repo = MovementScoreRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let user_id = claims.user_id.to_owned();
    let movement_result = movement_repo
        .get_movement_by_id(user_id.to_owned(), movement_id.to_owned())
        .await;
    let scores_result = score_repo
        .get_movement_scores(user_id.to_owned(), movement_id.to_owned())
        .await;

    movement_result.map(|movement| {
        scores_result
            .map(|scores| HttpResponse::Ok().json(MovementResponse::from_model(movement, scores)))
    })
}

#[post("/{id}")]
async fn create_movement_score(
    state: web::Data<AppState>,
    info: web::Path<String>,
    claims: Claims,
    movement_score: web::Json<CreateMovementScore>,
) -> Result<impl Responder, AppError> {
    let movement_id = info.to_owned();
    let logger = state
        .logger
        .new(o!("handler" => format!("POST /movements/{}", movement_id.to_owned())));
    info!(logger, "Creating movement score");

    let score_repo = MovementScoreRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let movement_id = info.to_owned();
    let user_id = claims.user_id.to_owned();
    let scores_result = score_repo
        .create_movement_score(user_id, movement_id, movement_score.into_inner())
        .await;

    scores_result.map(|score| HttpResponse::Created().json(score))
}

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_movements);
    cfg.service(create_movement);
    cfg.service(get_movement_by_id);
    cfg.service(create_movement_score);
}