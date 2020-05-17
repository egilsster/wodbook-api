use crate::db::connection::Connection;
// use crate::middlewares::auth::AuthorizationService;
use crate::models::user::{Login, Register};
use crate::repositories::user_repository::UserRepository;
use actix_web::http::StatusCode;
use actix_web::{get, post, web, HttpRequest, HttpResponse};

#[post("/login")]
async fn login(user: web::Json<Login>) -> HttpResponse {
    let _connection = Connection.init().await.unwrap();
    let _repository: UserRepository = UserRepository {
        connection: _connection,
    };
    let proc = _repository.login(user.into_inner()).await;

    match proc {
        Ok(_) => HttpResponse::Ok().json(proc.unwrap()),
        Err(_) => HttpResponse::Ok()
            .status(StatusCode::from_u16(401).unwrap())
            .json(proc.unwrap_err()),
    }
}

#[post("/register")]
async fn register(user: web::Json<Register>) -> HttpResponse {
    let _connection = Connection.init().await.unwrap();
    let _repository: UserRepository = UserRepository {
        connection: _connection,
    };
    // TODO(egilsster): payload validation / status codes
    let new_user = _repository.register(user.into_inner()).await;
    match new_user {
        Ok(user_res) => HttpResponse::Ok().json(user_res),
        Err(err) => HttpResponse::Ok().json(err),
    }
}

#[post("/me")]
async fn user_information(_req: HttpRequest) -> HttpResponse {
    let _auth = _req.headers().get("Authorization");
    let _split: Vec<&str> = _auth.unwrap().to_str().unwrap().split("Bearer").collect();
    let token = _split[1].trim();
    let _connection = Connection.init().await.unwrap();
    let _repository: UserRepository = UserRepository {
        connection: _connection,
    };
    match _repository.user_information(token).await {
        Ok(result) => HttpResponse::Ok().json(result.unwrap()),
        Err(err) => HttpResponse::Ok().json(err),
    }
}

#[get("/me")]
async fn user_information_get(_req: HttpRequest) -> HttpResponse {
    let _auth = _req.headers().get("Authorization");
    let _split: Vec<&str> = _auth.unwrap().to_str().unwrap().split("Bearer").collect();
    let token = _split[1].trim();
    let _connection = Connection.init().await.unwrap();
    let _repository: UserRepository = UserRepository {
        connection: _connection,
    };
    match _repository.user_information(token).await {
        Ok(result) => HttpResponse::Ok().json(result.unwrap()),
        Err(err) => HttpResponse::Ok().json(err),
    }
}

// #[post("/protected")]
// async fn protected(_: AuthorizationService) -> HttpResponse {
//     let _connection = Connection.init().await.unwrap();
//     let _repository: UserRepository = UserRepository {
//         connection: _connection,
//     };
//     HttpResponse::Ok().json(_repository.protected_function())
// }

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(login);
    cfg.service(register);
    cfg.service(user_information);
    cfg.service(user_information_get);
}
