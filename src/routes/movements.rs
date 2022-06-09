use crate::errors::AppError;
use crate::models::movement::{
    CreateMovement, CreateMovementScore, ManyMovementsResponse, MovementResponse, UpdateMovement,
    UpdateMovementScore,
};
use crate::models::user::Claims;
use crate::repositories::MovementRepository;
use crate::utils::AppState;
use actix_web::{delete, get, patch, post, web, HttpResponse, Responder};

#[get("")]
async fn get_movements(
    state: web::Data<AppState>,
    claims: Claims,
) -> Result<impl Responder, AppError> {
    info!("Getting all movements");
    let movement_repo = MovementRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let user_id = claims.user_id.as_ref();
    let result = movement_repo.get_movements(user_id).await;

    result.map(|movements| HttpResponse::Ok().json(ManyMovementsResponse { data: movements }))
}

#[post("")]
async fn create_movement(
    state: web::Data<AppState>,
    claims: Claims,
    movement: web::Json<CreateMovement>,
) -> Result<impl Responder, AppError> {
    info!("Creating a new movement");
    let movement_repo = MovementRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let user_id = claims.user_id.as_ref();
    let result = movement_repo
        .create_movement(user_id, movement.into_inner())
        .await;

    result.map(|movement| HttpResponse::Created().json(movement))
}

#[patch("/{id}")]
async fn update_movement(
    state: web::Data<AppState>,
    info: web::Path<String>,
    claims: Claims,
    movement: web::Json<UpdateMovement>,
) -> Result<impl Responder, AppError> {
    let movement_id = info.to_owned();
    let movement_repo = MovementRepository {
        mongo_client: state.mongo_client.clone(),
    };

    movement_repo
        .update_movement(claims.user_id.as_ref(), &movement_id, movement.into_inner())
        .await
        .map(|movement| HttpResponse::Ok().json(movement))
}

#[delete("/{id}")]
async fn delete_movement(
    state: web::Data<AppState>,
    info: web::Path<String>,
    claims: Claims,
) -> Result<impl Responder, AppError> {
    let movement_id = info;
    let movement_repo = MovementRepository {
        mongo_client: state.mongo_client.clone(),
    };

    movement_repo
        .delete_movement(claims.user_id.as_ref(), &movement_id)
        .await
        .map(|_| HttpResponse::NoContent())
}

#[get("/{id}")]
async fn get_movement_by_id(
    state: web::Data<AppState>,
    info: web::Path<String>,
    claims: Claims,
) -> Result<impl Responder, AppError> {
    let movement_id = info;
    let movement_repo = MovementRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let user_id = claims.user_id.as_ref();
    let movement = movement_repo
        .get_movement_by_id(user_id, &movement_id)
        .await?;

    let scores_result = movement_repo
        .get_movement_scores_for_movement(user_id, &movement)
        .await;

    scores_result
        .map(|scores| HttpResponse::Ok().json(MovementResponse::from_model(movement, scores)))
}

#[post("/{id}")]
async fn create_movement_score(
    state: web::Data<AppState>,
    info: web::Path<String>,
    claims: Claims,
    movement_score: web::Json<CreateMovementScore>,
) -> Result<impl Responder, AppError> {
    let movement_id = info;
    let movement_repo = MovementRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let user_id = claims.user_id.as_ref();
    let movement = movement_repo
        .find_movement_by_id(user_id, &movement_id)
        .await?;

    match movement {
        Some(movement) => movement_repo
            .create_movement_score(user_id, &movement, movement_score.into_inner())
            .await
            .map(|score| HttpResponse::Created().json(score)),
        None => Err(AppError::NotFound("Movement not found".to_string())),
    }
}

#[patch("/{movement_id}/{score_id}")]
async fn update_movement_score(
    state: web::Data<AppState>,
    params: web::Path<(String, String)>,
    claims: Claims,
    movement_score_update: web::Json<UpdateMovementScore>,
) -> Result<impl Responder, AppError> {
    let (movement_id, score_id) = params.into_inner();
    let movement_repo = MovementRepository {
        mongo_client: state.mongo_client.clone(),
    };

    movement_repo
        .update_movement_score_by_id(
            claims.user_id.as_ref(),
            &movement_id,
            &score_id,
            movement_score_update.into_inner(),
        )
        .await
        .map(|score| HttpResponse::Ok().json(score))
}

#[delete("/{movement_id}/{score_id}")]
async fn delete_movement_score(
    state: web::Data<AppState>,
    params: web::Path<(String, String)>,
    claims: Claims,
) -> Result<impl Responder, AppError> {
    let (movement_id, score_id) = params.into_inner();
    let movement_repo = MovementRepository {
        mongo_client: state.mongo_client.clone(),
    };

    movement_repo
        .delete_movement_score_by_id(claims.user_id.as_ref(), &movement_id, &score_id)
        .await
        .map(|_| HttpResponse::NoContent())
}

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_movements);
    cfg.service(create_movement);
    cfg.service(update_movement);
    cfg.service(delete_movement);
    cfg.service(get_movement_by_id);
    cfg.service(create_movement_score);
    cfg.service(update_movement_score);
    cfg.service(delete_movement_score);
}
