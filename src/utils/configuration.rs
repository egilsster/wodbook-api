pub use config::ConfigError;
use dotenv::dotenv;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct MongoConfig {
    pub username: String,
    pub password: String,
    pub host: String,
    pub port: i32,
    pub db_name: String,
}

#[derive(Deserialize)]
pub struct AuthConfig {
    pub secret: String,
}

#[derive(Deserialize)]
pub struct ServerConfig {
    pub host: String,
    pub port: i32,
}

#[derive(Deserialize)]
pub struct Config {
    pub server: ServerConfig,
    pub auth: AuthConfig,
    pub mongo: MongoConfig,
}

impl Config {
    pub fn from_env() -> Result<Self, ConfigError> {
        Self::load_dotenv();

        let mut cfg = config::Config::new();
        cfg.merge(config::Environment::new().separator("__"))?;
        cfg.try_into()
    }

    fn load_dotenv() {
        dotenv().ok();
    }
}
