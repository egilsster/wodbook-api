use crate::errors::AppError;
use crate::models::response::HealthResponse;
use crate::utils::api_docs::parse_spec;
use actix_web::{get, web, HttpResponse, Responder};

#[get("/health")]
pub async fn health() -> HttpResponse {
    HttpResponse::Ok().json(HealthResponse {
        status: "ok".to_owned(),
    })
}

#[get("/openapi")]
pub async fn api_docs() -> Result<impl Responder, AppError> {
    parse_spec().map(|result| HttpResponse::Ok().json(result))
}

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(health);
    cfg.service(api_docs);
}
