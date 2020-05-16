use actix_web::{get, web, HttpResponse};

#[get("/health")]
pub async fn health() -> HttpResponse {
    HttpResponse::Ok().finish()
}

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(health);
}
