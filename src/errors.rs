use actix_web::{error::ResponseError, http::StatusCode, HttpResponse};
use derive_more::Display;
use serde::Serialize;

#[derive(Display, Debug)]
pub enum AppError {
    #[display(fmt = "{}", _0)]
    BadRequest(String),
    #[display(fmt = "{}", _0)]
    Unauthorized(String),
    #[display(fmt = "{}", _0)]
    NotFound(String),
    #[display(fmt = "{}", _0)]
    Conflict(String),
    #[display(fmt = "{}", _0)]
    UnprocessableEntity(String),
    #[display(fmt = "{}", _0)]
    Internal(String),
}

#[derive(Serialize)]
pub struct AppErrorResponse {
    pub message: String,
}

impl ResponseError for AppError {
    fn status_code(&self) -> StatusCode {
        match *self {
            AppError::BadRequest(_) => StatusCode::BAD_REQUEST,
            AppError::Unauthorized(_) => StatusCode::UNAUTHORIZED,
            AppError::NotFound(_) => StatusCode::NOT_FOUND,
            AppError::Conflict(_) => StatusCode::CONFLICT,
            AppError::UnprocessableEntity(_) => StatusCode::UNPROCESSABLE_ENTITY,
            AppError::Internal(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
    fn error_response(&self) -> HttpResponse {
        HttpResponse::build(self.status_code()).json(AppErrorResponse {
            message: self.to_string(),
        })
    }
}
