use crate::errors::AppError;
use crate::utils::Config;
use mongodb::Client;

pub struct Connection;

impl Connection {
    pub async fn get_client(&self) -> Result<Client, AppError> {
        let config = Config::from_env().unwrap();

        Client::with_uri_str(&config.mongo.uri)
            .await
            .map_err(|err| {
                error!("Error connecting to mongo");
                AppError::Internal(err.to_string())
            })
    }
}
