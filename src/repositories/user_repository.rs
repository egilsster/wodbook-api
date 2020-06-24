use crate::errors::AppError;
use crate::models::response::{LoginResponse, UserResponse};
use crate::models::user::{Claims, CreateUser, Login, UpdateUser, User};
use crate::utils::{resources, Config};

use bson::{doc, from_bson, Bson};
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use mongodb::{Client, Collection};

static COLLECTION_NAME: &str = "users";

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

    pub async fn find_user_with_id(&self, user_id: Bson) -> Result<UserResponse, AppError> {
        let coll = self.get_collection();
        let cursor = coll
            .find_one(doc! { "_id":  user_id }, None)
            .await
            .map_err(|err| AppError::Internal(err.to_string()))?;

        if cursor.is_none() {
            return Err(AppError::NotFound("User not found".to_owned()));
        }

        match from_bson(Bson::Document(cursor.unwrap())) {
            Ok(model) => Ok(model),
            Err(err) => Err(AppError::Internal(err.to_string())),
        }
    }

    pub async fn update_user_with_email(
        &self,
        email: &str,
        user_update: UpdateUser,
    ) -> Result<User, AppError> {
        let mut user = self.find_user_with_email(email).await?;

        user.password = if user_update.password.is_some() {
            resources::create_hash(&user_update.password.unwrap())
        } else {
            user.password
        };
        user.first_name = user_update.first_name.unwrap_or(user.first_name);
        user.last_name = user_update.last_name.unwrap_or(user.last_name);
        user.date_of_birth = user_update.date_of_birth.unwrap_or(user.date_of_birth);
        user.height = user_update.height.unwrap_or(user.height);
        user.weight = user_update.weight.unwrap_or(user.weight);
        user.box_name = user_update.box_name.unwrap_or(user.box_name);
        user.avatar_url = user_update.avatar_url.unwrap_or(user.avatar_url);

        let user_doc = user.to_doc();

        let coll = self.get_collection();
        coll.update_one(doc! { "user_id": user.user_id }, user_doc, None)
            .await
            .map_err(|_| AppError::Internal("Could not update user".to_owned()))?;

        self.find_user_with_email(email).await
    }

    pub async fn find_user_with_email(&self, email: &str) -> Result<User, AppError> {
        let coll = self.get_collection();
        let cursor = coll
            .find_one(doc! {"email": email}, None)
            .await
            .map_err(|err| AppError::Internal(err.to_string()))?;

        if cursor.is_none() {
            return Err(AppError::NotFound("User not found".to_owned()));
        }

        match from_bson(Bson::Document(cursor.unwrap())) {
            Ok(model) => Ok(model),
            Err(_) => Err(AppError::Internal("Invalid document".to_owned())),
        }
    }

    pub async fn login(&self, user_login: Login) -> Result<LoginResponse, AppError> {
        let user = self.find_user_with_email(user_login.email.as_ref()).await;
        if user.is_err() {
            return Err(AppError::BadRequest(
                "Check your user information (user not found)".to_string(),
            ));
        }

        let user = user.unwrap();
        if user.password != resources::create_hash(&user_login.password) {
            return Err(AppError::BadRequest(
                "Check your user information".to_string(),
            ));
        }

        let config = Config::from_env().unwrap();
        let key = config.auth.secret.as_bytes();

        let date = if !user_login.remember_me {
            Utc::now() + Duration::hours(1)
        } else {
            Utc::now() + Duration::days(365)
        };

        let my_claims = Claims {
            sub: user_login.email,
            exp: date.timestamp() as usize,
            admin: user.admin,
            user_id: user.user_id,
        };
        let token = encode(
            &Header::default(),
            &my_claims,
            &EncodingKey::from_secret(key),
        )
        .unwrap();
        Ok(LoginResponse { token })
    }

    pub async fn register(&self, user: CreateUser) -> Result<UserResponse, AppError> {
        let existing_user = self.find_user_with_email(user.email.as_ref()).await;
        if existing_user.is_ok() {
            return Err(AppError::Conflict(
                "This e-mail is using by some user, please enter another e-mail.".to_string(),
            ));
        }

        let coll = self.get_collection();
        let hash_pw = resources::create_hash(&user.password);
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

        let result = coll
            .insert_one(user_doc, None)
            .await
            .map_err(|err| AppError::Internal(err.to_string()))?;

        self.find_user_with_id(result.inserted_id).await
    }
}
