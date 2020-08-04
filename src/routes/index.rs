use crate::errors::WebResult;
use crate::models::response::HealthResponse;
use crate::utils::api_docs::parse_spec;
use crate::utils::AppState;
use actix_web::{get, web, HttpResponse, Responder};

#[get("/health")]
pub async fn health(state: web::Data<AppState>) -> HttpResponse {
    let client = state.mongo_client.clone();
    let ping_res = client
        .database("admin")
        .run_command(doc! {"ping": 1}, None)
        .await;
    match ping_res {
        Ok(_) => HttpResponse::Ok().json(HealthResponse {
            status: "ok".to_owned(),
        }),
        Err(_) => HttpResponse::ServiceUnavailable().json(HealthResponse {
            status: "mongodb not available".to_owned(),
        }),
    }
}

#[get("/openapi")]
pub async fn api_docs() -> WebResult<impl Responder> {
    parse_spec().map(|result| HttpResponse::Ok().json(result))
}

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(health);
    cfg.service(api_docs);
}
