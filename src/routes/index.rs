use crate::models::response::HealthResponse;
use actix_web::{get, web, HttpResponse};

#[get("/health")]
pub async fn health() -> HttpResponse {
    HttpResponse::Ok().json(HealthResponse {
        status: "ok".to_owned(),
    })
}

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(health);
}
