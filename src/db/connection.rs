use crate::utils::Config;
use mongodb::Client;

pub struct Connection;

impl Connection {
    pub async fn get_client(&self) -> Result<Client, ()> {
        let config = Config::from_env().unwrap();
        let client = Client::with_uri_str(&config.mongo.uri).await;
        if client.is_err() {
            error!(
                "Error when creating mongodb client: {}",
                client.unwrap_err().to_string()
            );
            std::process::exit(1)
        }

        let client = client.unwrap();
        let ping_res = client
            .database("admin")
            .run_command(doc! {"ping": 1}, None)
            .await;

        if ping_res.is_ok() {
            info!("Connected to mongodb");
        } else {
            error!("Connection to mongo is not functioning");
        }

        Ok(client)
    }
}
