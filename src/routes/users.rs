use crate::db::connection::Connection;
use crate::errors::AppError;
use crate::models::user::{Login, Register};
use crate::repositories::user_repository::UserRepository;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};

#[post("/login")]
async fn login(user: web::Json<Login>) -> Result<impl Responder, AppError> {
    let connection = Connection.init().await.unwrap();
    let user_repo = UserRepository { connection };

    let result = user_repo.login(user.into_inner()).await;

    result.map(|user| HttpResponse::Ok().json(user))
}

#[post("/register")]
async fn register(user: web::Json<Register>) -> Result<impl Responder, AppError> {
    let connection = Connection.init().await.unwrap();
    let user_repo = UserRepository { connection };

    let result = user_repo.register(user.into_inner()).await;

    result.map(|user| HttpResponse::Created().json(user))
}

#[post("/me")]
async fn user_information(req: HttpRequest) -> Result<impl Responder, AppError> {
    let auth_header = req.headers().get("Authorization");
    let token_split: Vec<&str> = auth_header
        .unwrap()
        .to_str()
        .unwrap()
        .split("Bearer")
        .collect();
    let token = token_split[1].trim();
    let connection = Connection.init().await.unwrap();
    let user_repo = UserRepository { connection };

    let result = user_repo.user_information(token).await;

    result.map(|user| HttpResponse::Ok().json(user))
}

#[get("/me")]
async fn user_information_get(req: HttpRequest) -> Result<impl Responder, AppError> {
    let auth_header = req.headers().get("Authorization");
    let token_split: Vec<&str> = auth_header
        .unwrap()
        .to_str()
        .unwrap()
        .split("Bearer")
        .collect();
    let token = token_split[1].trim();
    let connection = Connection.init().await.unwrap();
    let user_repo = UserRepository { connection };

    let result = user_repo.user_information(token).await;

    result.map(|user| HttpResponse::Ok().json(user))
}

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(login);
    cfg.service(register);
    cfg.service(user_information);
    cfg.service(user_information_get);
}
