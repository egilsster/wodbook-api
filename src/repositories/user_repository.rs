use crate::errors::AppError;
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

/// Generates a JWT based on user data and if the user wants to stay logged in (makes it expire in a year).
fn gen_token(key: &[u8], user: User, email: &str, remember_me: bool) -> Result<String, AppError> {
    let date = if !remember_me {
        Utc::now() + Duration::hours(1)
    } else {
        Utc::now() + Duration::days(365)
    };

    let my_claims = Claims {
        sub: email.to_owned(),
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
    Ok(token)
}

impl UserRepository {
    fn get_collection(&self) -> Collection {
        let config = Config::from_env().unwrap();
        let database_name = config.mongo.db_name;
        let db = self.mongo_client.database(database_name.as_str());
        db.collection(COLLECTION_NAME)
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

    pub async fn login(&self, user_login: Login) -> Result<String, AppError> {
        let config = Config::from_env().unwrap();
        let key = config.auth.secret.as_bytes();
        let user_email: &str = user_login.email.as_ref();

        let user = self.find_user_with_email(user_email).await;
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

        let token = gen_token(key, user, user_email, user_login.remember_me).unwrap();

        Ok(token)
    }

    pub async fn register(&self, create_user: CreateUser) -> Result<String, AppError> {
        let config = Config::from_env().unwrap();
        let key = config.auth.secret.as_bytes();
        let user_email: &str = create_user.email.as_ref();

        let existing_user = self.find_user_with_email(user_email).await;
        if existing_user.is_ok() {
            return Err(AppError::Conflict(
                "This e-mail is using by some user, please enter another e-mail.".to_string(),
            ));
        }

        let coll = self.get_collection();
        let hash_pw = resources::create_hash(&create_user.password);
        let id = uuid::Uuid::new_v4().to_string();
        let user_doc = doc! {
            "user_id": id,
            "email": user_email,
            "password": hash_pw,
            "first_name": create_user.first_name,
            "last_name": create_user.last_name,
            "date_of_birth": create_user.date_of_birth,
            "height": create_user.height,
            "weight": create_user.weight,
            "box_name": create_user.box_name,
            "avatar_url": "",
        };

        coll.insert_one(user_doc, None)
            .await
            .map_err(|err| AppError::Internal(err.to_string()))?;

        let user = self.find_user_with_email(user_email).await?;
        let token = gen_token(key, user, user_email, false).unwrap();

        Ok(token)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use dotenv::dotenv;

    #[test]
    fn test_gen_token() {
        dotenv().ok();

        let res1 = gen_token(
            "my_key".as_bytes(),
            User {
                user_id: "user_id".to_owned(),
                email: "email".to_owned(),
                password: "password".to_owned(),
                admin: false,
                first_name: "first_name".to_owned(),
                last_name: "last_name".to_owned(),
                date_of_birth: "date_of_birth".to_owned(),
                height: 185,
                weight: 85000,
                box_name: "box_name".to_owned(),
                avatar_url: "avatar_url".to_owned(),
            },
            "email",
            false,
        )
        .unwrap();
        assert!(res1.starts_with("ey"));

        let res2 = gen_token(
            "some_key".as_bytes(),
            User {
                user_id: "user_id".to_owned(),
                email: "email".to_owned(),
                password: "password".to_owned(),
                admin: true,
                first_name: "first_name".to_owned(),
                last_name: "last_name".to_owned(),
                date_of_birth: "date_of_birth".to_owned(),
                height: 185,
                weight: 85000,
                box_name: "box_name".to_owned(),
                avatar_url: "avatar_url".to_owned(),
            },
            "email",
            true,
        )
        .unwrap();
        assert!(res2.starts_with("ey"));
    }
}
