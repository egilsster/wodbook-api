use crate::errors::{AppError, WebResult};
use crate::models::user::{Claims, CreateUser, Login, UpdateUser, User};
use crate::utils::{resources, Config};

use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use mongodb::{Client, Collection};

static COLLECTION_NAME: &str = "users";

pub struct UserRepository {
    pub mongo_client: Client,
}

/// Generates a JWT based on user data and if the user wants to stay logged in (makes it expire in a year).
fn gen_token(key: &[u8], user: User, email: &str, remember_me: bool) -> WebResult<String> {
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
    .map_err(|e| AppError::Unauthorized(e.to_string()))?;

    Ok(token)
}

impl UserRepository {
    fn get_collection(&self) -> Collection<User> {
        let config = Config::from_env().unwrap();
        let database_name = config.mongo.db_name;
        let db = self.mongo_client.database(database_name.as_str());
        db.collection(COLLECTION_NAME)
    }

    pub async fn update_user_with_email(
        &self,
        email: &str,
        user_update: UpdateUser,
    ) -> WebResult<User> {
        let user = self.find_user_with_email(email).await?;

        let updated_password = if user_update.password.is_some() {
            resources::create_hash(&user_update.password.unwrap())
        } else {
            user.password
        };
        let updated_first_name = user_update.first_name.unwrap_or(user.first_name);
        let updated_last_name = user_update.last_name.unwrap_or(user.last_name);
        let updated_date_of_birth = user_update.date_of_birth.unwrap_or(user.date_of_birth);
        let updated_height = user_update.height.unwrap_or(user.height);
        let updated_weight = user_update.weight.unwrap_or(user.weight);
        let updated_box_name = user_update.box_name.unwrap_or(user.box_name);
        let updated_avatar_url = user_update.avatar_url.unwrap_or(user.avatar_url);

        let query = doc! { "user_id": user.user_id.to_owned() };
        let update = doc! {
            "$set": {
                "password": updated_password,
                "first_name": updated_first_name,
                "last_name": updated_last_name,
                "date_of_birth": updated_date_of_birth,
                "height": updated_height,
                "weight": updated_weight,
                "box_name": updated_box_name,
                "avatar_url": updated_avatar_url,
            }
        };
        let coll = self.get_collection();
        coll.update_one(query, update, None).await?;

        self.find_user_with_email(email).await
    }

    pub async fn find_user_with_email(&self, email: &str) -> WebResult<User> {
        let coll = self.get_collection();
        let cursor = coll.find_one(doc! {"email": email}, None).await?;

        match cursor {
            Some(model) => Ok(model),
            None => Err(AppError::NotFound("User not found".to_owned())),
        }
    }

    pub async fn login(&self, user_login: Login) -> WebResult<String> {
        let config = Config::from_env().unwrap();
        let key = config.auth.secret.as_bytes();
        let user_email: &str = user_login.email.as_ref();

        let user = self.find_user_with_email(user_email).await.map_err(|_| {
            AppError::BadRequest("Check your user information (user not found)".to_string())
        })?;

        if user.password != resources::create_hash(&user_login.password) {
            return Err(AppError::BadRequest(
                "Check your user information".to_string(),
            ));
        }

        gen_token(key, user, user_email, user_login.remember_me)
    }

    pub async fn register(&self, create_user: CreateUser) -> WebResult<String> {
        let config = Config::from_env().unwrap();
        let key = config.auth.secret.as_bytes();
        let user_email: &str = create_user.email.as_ref();

        let coll = self.get_collection();
        let hash_pw = resources::create_hash(&create_user.password);
        let id = uuid::Uuid::new_v4().to_string();
        let user_doc = User {
            user_id: id,
            admin: false,
            email: user_email.to_owned(),
            password: hash_pw,
            first_name: create_user.first_name,
            last_name: create_user.last_name,
            date_of_birth: create_user.date_of_birth,
            height: create_user.height,
            weight: create_user.weight,
            box_name: create_user.box_name,
            avatar_url: "".to_owned(),
        };

        coll.insert_one(user_doc, None).await?;

        let user = self.find_user_with_email(user_email).await?;
        gen_token(key, user, user_email, false)
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
