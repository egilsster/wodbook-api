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
    type Config = ();

    fn from_request(_req: &HttpRequest, _payload: &mut dev::Payload) -> Self::Future {
        let _auth = _req.headers().get("Authorization");
        match _auth {
            Some(_) => {
                let _split: Vec<&str> = _auth.unwrap().to_str().unwrap().split("Bearer").collect();
                let token = _split[1].trim();
                let config = Config::from_env().unwrap();
                let _var = config.auth.secret;
                let key = _var.as_bytes();
                match decode::<Claims>(
                    token,
                    &DecodingKey::from_secret(key),
                    &Validation::new(Algorithm::HS256),
                ) {
                    Ok(token_data) => ok(token_data.claims),
                    Err(_e) => err(ErrorUnauthorized(AppError::Unauthorized(
                        "Invalid token".to_string(),
                    ))),
                }
            }
            None => err(ErrorUnauthorized(AppError::Unauthorized(
                "No token present".to_string(),
            ))),
        }
    }
}
