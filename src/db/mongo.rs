use crate::utils::Config;
use mongodb::Client;

pub struct Connection {
    pub client: Client,
}

pub fn build_indexes() -> Vec<bson::Document> {
    let users_index = doc! {
        "createIndexes": "users",
        "indexes": [
            {
                "key": { "email": 1 },
                "name": "users-index",
                "unique": true
            },
        ]
    };
    let workouts_index = doc! {
        "createIndexes": "workouts",
        "indexes": [
            {
                "key": { "user_id": 1, "name": 1, "measurement": 1 },
                "name": "workouts-index",
                "unique": true
            },
        ]
    };
    let movements_index = doc! {
        "createIndexes": "movements",
        "indexes": [
            {
                "key": { "user_id": 1, "name": 1, "measurement": 1 },
                "name": "movements-index",
                "unique": true
            },
        ]
    };

    vec![users_index, workouts_index, movements_index]
}

impl Connection {
    pub async fn new() -> Result<Self, ()> {
        let config = Config::from_env().unwrap();

        match Client::with_uri_str(&config.mongo.uri).await {
            Ok(client) => {
                let ping_res = client
                    .database("admin")
                    .run_command(doc! {"ping": 1}, None)
                    .await;

                if ping_res.is_ok() {
                    info!("Connected to mongodb");
                } else {
                    // Do not block startup if it can not connect
                    error!("Not able to connect to mongodb");
                }

                Ok(Connection { client })
            }
            Err(err) => {
                error!("Error when creating mongodb client: {}", err.to_string());
                std::process::exit(1)
            }
        }
    }

    pub async fn create_indexes(&self) -> bool {
        let config = Config::from_env().unwrap();
        let client = self.client.clone();
        let mut has_error = false;

        for index in build_indexes() {
            // Replace with mongo method when it gets implemented
            // https://github.com/mongodb/mongo-rust-driver/pull/188
            let res = client
                .database(&config.mongo.db_name)
                .run_command(index, None)
                .await;

            if res.is_err() {
                has_error = true;
            }
        }

        has_error
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_indexes() {
        let res = build_indexes();
        assert_eq!(res.len(), 3);
    }
}
