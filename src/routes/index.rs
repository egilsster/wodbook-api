use crate::errors::AppError;
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
pub async fn api_docs() -> Result<impl Responder, AppError> {
    parse_spec().map(|result| HttpResponse::Ok().json(result))
}

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(health);
    cfg.service(api_docs);
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::connection::Connection;
    use actix_web::{http::StatusCode, test, web, App};
    use dotenv::dotenv;

    #[actix_rt::test]
    #[ignore]
    async fn test_health_get() {
        dotenv().ok();

        let mongo_client = Connection.get_client().await.unwrap();

        let mut app = test::init_service(
            App::new()
                .data(AppState { mongo_client })
                .service(web::scope("/").configure(init_routes)),
        )
        .await;
        let req = test::TestRequest::get().uri("/health").to_request();
        let resp = test::call_service(&mut app, req).await;

        assert_eq!(resp.status(), StatusCode::OK);
    }

    #[actix_rt::test]
    #[ignore]
    async fn test_openapi_get() {
        let mut app =
            test::init_service(App::new().service(web::scope("/").configure(init_routes))).await;
        let req = test::TestRequest::get().uri("/openapi").to_request();
        let resp = test::call_service(&mut app, req).await;

        assert_eq!(resp.status(), StatusCode::OK);
    }
}
