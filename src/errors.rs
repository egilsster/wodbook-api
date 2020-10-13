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
            AppError::Internal(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
    fn error_response(&self) -> HttpResponse {
        HttpResponse::build(self.status_code()).json(AppErrorResponse {
            message: self.to_string(),
        })
    }
}

pub type WebResult<T> = Result<T, AppError>;

// Would be better to extract the error code and use that in a match
// with a wide range of error codes to handle
pub fn parse_mongodb_error(err: mongodb::error::Error) -> AppError {
    let message = err.to_string();
    match std::sync::Arc::try_unwrap(err.kind) {
        Ok(mongodb::error::ErrorKind::WriteError(_)) => {
            if message.contains("E11000") {
                AppError::Conflict(format!("Entity already exists: {}", message))
            } else {
                AppError::Internal(message)
            }
        }
        _ => AppError::Internal(message),
    }
}

/// Makes it possible to use '?' to try into an app error
impl From<mongodb::error::Error> for AppError {
    fn from(err: mongodb::error::Error) -> Self {
        parse_mongodb_error(err)
    }
}
