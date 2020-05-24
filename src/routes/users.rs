use crate::errors::AppError;
use crate::models::user::Claims;
use crate::models::user::{Login, Register};
use crate::repositories::user_repository::UserRepository;
use crate::utils::AppState;
use actix_web::{get, post, web, HttpResponse, Responder};
use slog::{info, o};

#[post("/login")]
async fn login(
    state: web::Data<AppState>,
    user: web::Json<Login>,
) -> Result<impl Responder, AppError> {
    let logger = state.logger.new(o!("handler" => "POST /login"));
    info!(logger, "Logging in a user");
    let user_repo = UserRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let result = user_repo.login(user.into_inner()).await;

    result.map(|user| HttpResponse::Ok().json(user))
}

#[post("/register")]
async fn register(
    state: web::Data<AppState>,
    user: web::Json<Register>,
) -> Result<impl Responder, AppError> {
    let logger = state.logger.new(o!("handler" => "POST /register"));
    info!(logger, "Registering new user");
    let user_repo = UserRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let result = user_repo.register(user.into_inner()).await;

    result.map(|user| HttpResponse::Created().json(user))
}

#[get("/me")]
async fn get_user_information(
    state: web::Data<AppState>,
    claims: Claims,
) -> Result<impl Responder, AppError> {
    let logger = state.logger.new(o!("handler" => "GET /me"));
    info!(logger, "Getting information about logged in user");
    let user_repo = UserRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let result = user_repo.user_information(claims.sub.to_owned()).await;

    result.map(|user| HttpResponse::Ok().json(user))
}

#[post("/me")]
async fn update_user_information(
    state: web::Data<AppState>,
    claims: Claims,
) -> Result<impl Responder, AppError> {
    // TODO(egilsster): Implement updating user
    let logger = state.logger.new(o!("handler" => "POST /me"));
    info!(logger, "Updating information about logged in user");
    let user_repo = UserRepository {
        mongo_client: state.mongo_client.clone(),
    };

    let result = user_repo.user_information(claims.sub.to_owned()).await;

    result.map(|user| HttpResponse::Ok().json(user))
}

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(login);
    cfg.service(register);
    cfg.service(get_user_information);
    cfg.service(update_user_information);
}
