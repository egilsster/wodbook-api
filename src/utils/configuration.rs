pub use config::ConfigError;
use mongodb::Client;
use serde::Deserialize;
use slog::{o, Drain, Logger};

#[derive(Clone)]
pub struct AppState {
    pub mongo_client: Client,
    pub logger: Logger,
}

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
        let mut cfg = config::Config::new();
        cfg.merge(config::Environment::new().separator("__"))?;
        cfg.try_into()
    }

    pub fn configure_log() -> Logger {
        let decorator = slog_term::TermDecorator::new().build();
        let console_drain = slog_term::FullFormat::new(decorator).build().fuse();
        let console_drain = slog_envlogger::new(console_drain);
        let console_drain = slog_async::Async::new(console_drain).build().fuse();
        slog::Logger::root(console_drain, o!("v" => env!("CARGO_PKG_VERSION")))
    }
}
