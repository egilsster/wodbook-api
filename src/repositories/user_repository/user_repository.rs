use crate::errors::AppError;
use crate::models::response::{LoginResponse, UserResponse};
use crate::models::user::{Claims, Login, Register, User};
use crate::utils::Config;

use bson::{doc, from_bson, Bson};
use chrono::{DateTime, Duration, Utc};
use crypto::digest::Digest;
use crypto::sha2::Sha256;
use jsonwebtoken::{encode, EncodingKey, Header};
use mongodb::error::Error;
use mongodb::{Client, Collection};

static COLLECTION_NAME: &'static str = "users";

pub struct UserRepository {
    pub mongo_client: Client,
}

impl UserRepository {
    fn get_collection(&self) -> Collection {
        let config = Config::from_env().unwrap();
        let database_name = config.mongo.db_name;
        let db = self.mongo_client.database(database_name.as_str());
        db.collection(COLLECTION_NAME)
    }
    pub async fn find_user_with_id(&self, user_id: Bson) -> Result<Option<UserResponse>, AppError> {
        let coll = self.get_collection();
        let cursor = coll.find_one(doc! { "_id":  user_id }, None).await.unwrap();

        match cursor {
            Some(doc) => match from_bson(Bson::Document(doc)) {
                Ok(model) => Ok(model),
                Err(err) => Err(AppError::DbError(err.to_string())),
            },
            None => Ok(None),
        }
    }
    pub async fn find_user_with_email(&self, email: String) -> Result<Option<User>, Error> {
        let coll = self.get_collection();
        let cursor = coll.find_one(doc! {"email": email}, None).await.unwrap();
        match cursor {
            Some(doc) => match from_bson(Bson::Document(doc)) {
                Ok(model) => Ok(model),
                Err(e) => Err(Error::from(e)),
            },
            None => Ok(None),
        }
    }
    pub async fn login(&self, user: Login) -> Result<LoginResponse, AppError> {
        let user_doc = self
            .find_user_with_email(user.email.to_string())
            .await
            .unwrap();
        match user_doc {
            Some(x) => {
                let mut sha = Sha256::new();
                sha.input_str(user.password.as_str());
                if x.password == sha.result_str() {
                    // JWT
                    let config = Config::from_env().unwrap();
                    let key = config.auth.secret.as_bytes();

                    let mut _date: DateTime<Utc>;
                    // Remember Me
                    if !user.remember_me {
                        _date = Utc::now() + Duration::hours(1);
                    } else {
                        _date = Utc::now() + Duration::days(365);
                    }
                    let my_claims = Claims {
                        sub: user.email,
                        exp: _date.timestamp() as usize,
                        admin: x.admin,
                        user_id: x.user_id,
                    };
                    let token = encode(
                        &Header::default(),
                        &my_claims,
                        &EncodingKey::from_secret(key),
                    )
                    .unwrap();
                    Ok(LoginResponse { token })
                } else {
                    Err(AppError::BadRequest(
                        "Check your user information".to_string(),
                    ))
                }
            }
            None => Err(AppError::BadRequest(
                "Check your user information (user not found)".to_string(),
            )),
        }
    }
    pub async fn register(&self, user: Register) -> Result<UserResponse, AppError> {
        let _exist = self
            .find_user_with_email((&user.email).parse().unwrap())
            .await
            .unwrap();
        match _exist {
            Some(_) => Err(AppError::Conflict(
                "This e-mail is using by some user, please enter another e-mail.".to_string(),
            )),
            None => {
                let coll = self.get_collection();
                let mut sha = Sha256::new();
                sha.input_str(user.password.as_str());
                let hash_pw = sha.result_str();
                let id = uuid::Uuid::new_v4().to_string();
                let user_doc = doc! {
                    "user_id": id,
                    "email": user.email,
                    "password": hash_pw,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "date_of_birth": user.date_of_birth,
                    "height": user.height,
                    "weight": user.weight,
                    "box_name": user.box_name,
                    "avatar_url": "",
                };

                let insert_result = coll.insert_one(user_doc, None).await;
                match insert_result {
                    Ok(result) => match self.find_user_with_id(result.inserted_id).await.unwrap() {
                        Some(new_user) => Ok(new_user),
                        None => Err(AppError::DbError(
                            "New user not found after inserting".to_string(),
                        )),
                    },
                    Err(err) => Err(AppError::DbError(err.to_string())),
                }
            }
        }
    }

    pub async fn user_information(&self, sub: String) -> Result<Option<User>, AppError> {
        self.find_user_with_email(sub.to_string())
            .await
            .map_err(|err| AppError::DbError(err.to_string()))
    }
}
