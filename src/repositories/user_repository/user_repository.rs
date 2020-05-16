use crate::utils::Config;
use crate::models::response::{LoginResponse, Response};
use crate::models::user::{Claims, Login, Register, User};
use chrono::{DateTime, Duration, Utc};
use crypto::digest::Digest;
use crypto::sha2::Sha256;
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use mongodb::error::Error;
use mongodb::{Client, Database};

static COLLECTION_NAME: &'static str = "users";

pub trait IUserRepository {
    fn get_database(&self) -> Database;
    fn find_user_with_email(&self, email: String) -> Result<Option<User>, Error>;
    fn login(&self, login: Login) -> Result<LoginResponse, Response>;
    fn register(&self, user: Register) -> Response;
    fn user_information(&self, token: &str) -> Result<Option<User>, Response>;
    fn protected_function(&self) -> bool;
}

pub struct UserRepository {
    pub connection: &'static Client,
}

impl IUserRepository for UserRepository {
    fn get_database(&self) -> Database {
        let config = Config::from_env().unwrap();
        let database_name = config.mongo.db_name;

        self.connection.database(database_name.as_str())
    }
    fn find_user_with_email(&self, email: String) -> Result<Option<User>, Error> {
        let db = self.get_database();
        let cursor = db
            .collection(COLLECTION_NAME)
            .find_one(doc! {"email": email}, None)
            .unwrap();
        match cursor {
            Some(doc) => match bson::from_bson(bson::Bson::Document(doc)) {
                Ok(model) => Ok(model),
                Err(e) => Err(Error::from(e)),
            },
            None => Ok(None),
        }
    }
    fn login(&self, user: Login) -> Result<LoginResponse, Response> {
        match self.find_user_with_email(user.email.to_string()).unwrap() {
            Some(x) => {
                let mut sha = Sha256::new();
                sha.input_str(user.password.as_str());
                if x.password == sha.result_str() {
                    // JWT
                    let config = Config::from_env().unwrap();
                    let _var = config.auth.secret;
                    let key = _var.as_bytes();

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
                    };
                    let token = encode(
                        &Header::default(),
                        &my_claims,
                        &EncodingKey::from_secret(key),
                    )
                    .unwrap();
                    Ok(LoginResponse {
                        status: true,
                        token,
                        message: "You have successfully logged in.".to_string(),
                    })
                } else {
                    Err(Response {
                        status: false,
                        message: "Check your user information.".to_string(),
                    })
                }
            }
            None => Err(Response {
                status: false,
                message: "Check your user information.".to_string(),
            }),
        }
    }
    fn register(&self, user: Register) -> Response {
        let _exist = self
            .find_user_with_email((&user.email).parse().unwrap())
            .unwrap();
        match _exist {
            Some(_) => Response {
                message: "This e-mail is using by some user, please enter another e-mail."
                    .to_string(),
                status: false,
            },
            None => {
                let db = self.get_database();
                let mut sha = Sha256::new();
                sha.input_str(user.password.as_str());
                let hash_pw = sha.result_str();
                let user_id = uuid::Uuid::new_v4().to_string();
                let _ex = db.collection(COLLECTION_NAME).insert_one(doc! {"user_id": user_id, "name": user.name, "surname": user.surname, "email": user.email, "password": hash_pw, "phone": "", "birth_date": "" }, None);
                match _ex {
                    Ok(_) => Response {
                        status: true,
                        message: "Register successful.".to_string(),
                    },
                    Err(_) => Response {
                        status: false,
                        message: "Something wrong.".to_string(),
                    },
                }
            }
        }
    }

    fn user_information(&self, token: &str) -> Result<Option<User>, Response> {
        let config = Config::from_env().unwrap();
        let _var = config.auth.secret;
        let key = _var.as_bytes();
        let _decode = decode::<Claims>(
            token,
            &DecodingKey::from_secret(key),
            &Validation::new(Algorithm::HS256),
        );
        match _decode {
            Ok(decoded) => {
                match self.find_user_with_email((decoded.claims.sub.to_string()).parse().unwrap()) {
                    Ok(user) => Ok(user),
                    Err(_) => Err(Response {
                        status: false,
                        message: "Something Wrong".to_string(),
                    }),
                }
            }
            Err(_) => Err(Response {
                status: false,
                message: "Invalid Token".to_string(),
            }),
        }
    }

    fn protected_function(&self) -> bool {
        true
    }
}
