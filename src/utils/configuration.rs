pub use config::ConfigError;
use mongodb::Client;
use serde::Deserialize;

fn default_server_host() -> String {
    "0.0.0.0".to_string()
}

fn default_server_port() -> i32 {
    43210
}

#[derive(Clone)]
pub struct AppState {
    pub mongo_client: Client,
}

#[derive(Deserialize)]
pub struct MongoConfig {
    pub db_name: String,
    pub uri: String,
}

#[derive(Deserialize)]
pub struct AuthConfig {
    pub secret: String,
}

#[derive(Deserialize)]
pub struct Config {
    #[serde(default = "default_server_host")]
    pub host: String,
    #[serde(default = "default_server_port")]
    pub port: i32,

    pub auth: AuthConfig,
    pub mongo: MongoConfig,
}

impl Config {
    pub fn from_env() -> Result<Self, ConfigError> {
        let env = config::Environment::default()
            .separator("__")
            .ignore_empty(true);

        config::Config::builder()
            .add_source(env)
            .build()?
            .try_deserialize()
    }
}
