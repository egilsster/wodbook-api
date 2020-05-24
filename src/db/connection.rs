use crate::errors::AppError;
use crate::utils::Config;
use mongodb::Client;
use slog::{crit, o, Logger};

pub struct Connection;

impl Connection {
    pub async fn get_client(&self, logger: Logger) -> Result<Client, AppError> {
        let config = Config::from_env().unwrap();
        let host = config.mongo.host;
        let port = config.mongo.port;
        let mongo_addr = format!("mongodb://{}:{}/", host, port);

        Client::with_uri_str(&mongo_addr).await.map_err(|err| {
            let sub_logger = logger.new(o!("cause" => err.to_string()));
            crit!(sub_logger, "Error connecting to mongo");
            AppError::DbError(err.to_string())
        })
    }
}
