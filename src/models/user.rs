use serde::{Deserialize, Serialize};

// https://github.com/serde-rs/serde/issues/1030#issuecomment-522278006
fn default_as_false() -> bool {
    false
}

#[derive(Serialize, Deserialize, Debug)]
pub struct User {
    pub user_id: String,
    pub email: String,
    pub password: String,
    #[serde(default = "default_as_false")]
    pub admin: bool,
    pub first_name: String,
    pub last_name: String,
    pub date_of_birth: String,
    pub height: i32,
    pub weight: i32,
    pub box_name: String,
    pub avatar_url: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Login {
    pub email: String,
    pub password: String,
    #[serde(default)]
    pub remember_me: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
    pub admin: bool,
    pub user_id: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateUser {
    pub email: String,
    pub password: String,
    pub first_name: String,
    pub last_name: String,
    pub date_of_birth: String,
    pub height: i32,
    pub weight: i32,
    pub box_name: String,
    pub avatar_url: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateUser {
    pub password: Option<String>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub date_of_birth: Option<String>,
    pub height: Option<i32>,
    pub weight: Option<i32>,
    pub box_name: Option<String>,
    pub avatar_url: Option<String>,
}
