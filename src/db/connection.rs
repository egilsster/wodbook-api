use crate::utils::Config;
use mongodb::{error, Client};

pub struct Connection;

impl Connection {
    pub async fn init(&self) -> Result<Client, error::Error> {
        // TODO(egilsster): cache connection
        let config = Config::from_env().unwrap();
        let host = config.mongo.host;
        let port = config.mongo.port;
        let mongo_addr = format!("mongodb://{}:{}/", host, port);
        let connection = Client::with_uri_str(&mongo_addr).await;
        connection
    }
}
