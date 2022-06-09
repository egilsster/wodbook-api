use crate::errors::AppError;
use crate::models::user::Claims;
use crate::utils::Config;

use actix_web::error::ErrorUnauthorized;
use actix_web::{dev, Error, FromRequest, HttpRequest};
use futures::future::{err, ok, Ready};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};

// TODO(egilsster): return a json response
impl FromRequest for Claims {
    type Error = Error;
    type Future = Ready<Result<Claims, Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut dev::Payload) -> Self::Future {
        let auth = req.headers().get("Authorization");

        if auth.is_none() {
            return err(ErrorUnauthorized(AppError::Unauthorized(
                "No token present".to_string(),
            )));
        }

        let token = auth.unwrap().to_str().unwrap().replace("Bearer ", "");
        let config = Config::from_env().unwrap();

        match decode::<Claims>(
            token.trim(),
            &DecodingKey::from_secret(config.auth.secret.as_bytes()),
            &Validation::new(Algorithm::HS256),
        ) {
            Ok(token_data) => ok(token_data.claims),
            Err(_e) => err(ErrorUnauthorized(AppError::Unauthorized(
                "Invalid token".to_string(),
            ))),
        }
    }
}
