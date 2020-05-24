use crate::errors::AppError;
use crate::models::movement::{CreateMovement, MovementModel};
use crate::utils::Config;

use bson::{doc, from_bson, Bson};
use chrono::Utc;
use futures::stream::StreamExt;
use mongodb::options::FindOptions;
use mongodb::{Client, Collection};
use std::vec::Vec;

static WORKOUT_COLLECTION_NAME: &'static str = "movements";

// TODO(egilsster): Can this be done with enum (and match?)?
static VALID_MEASUREMENTS: [&str; 4] = ["weight", "distance", "reps", "height"];

pub struct MovementRepository {
    pub mongo_client: Client,
}

impl MovementRepository {
    fn get_movement_collection(&self) -> Collection {
        let config = Config::from_env().unwrap();
        let database_name = config.mongo.db_name;
        let db = self.mongo_client.database(database_name.as_str());
        db.collection(WORKOUT_COLLECTION_NAME)
    }

    pub async fn find_movement_by_name(
        &self,
        user_id: String,
        name: String,
    ) -> Result<Option<MovementModel>, AppError> {
        let filter = doc! { "$or": [ { "user_id": user_id, "name": name }, { "global": true } ] };
        let cursor = self
            .get_movement_collection()
            .find_one(filter, None)
            .await
            .map_err(|err| AppError::DbError(err.to_string()))?;

        match cursor {
            Some(doc) => match from_bson(Bson::Document(doc)) {
                Ok(model) => Ok(model),
                Err(e) => Err(AppError::DbError(e.to_string())),
            },
            None => Ok(None),
        }
    }

    pub async fn find_movement_by_id(
        &self,
        user_id: String,
        movement_id: String,
    ) -> Result<Option<MovementModel>, AppError> {
        let filter = doc! { "$or": [ { "movement_id": movement_id, "user_id": user_id }, { "global": true } ] };
        let cursor = self
            .get_movement_collection()
            .find_one(filter, None)
            .await
            .map_err(|err| AppError::DbError(err.to_string()))?;

        match cursor {
            Some(doc) => match from_bson(Bson::Document(doc)) {
                Ok(model) => Ok(model),
                Err(e) => Err(AppError::DbError(e.to_string())),
            },
            None => Ok(None),
        }
    }

    pub async fn get_movements(&self, user_id: String) -> Result<Vec<MovementModel>, AppError> {
        let filter = doc! { "$or": [ { "user_id": user_id }, { "global": true } ] };
        let find_options = FindOptions::builder().sort(doc! { "name": 1 }).build();
        let mut cursor = self
            .get_movement_collection()
            .find(filter, find_options)
            .await
            .map_err(|err| AppError::DbError(err.to_string()))?;

        let mut vec: Vec<MovementModel> = Vec::new();

        while let Some(result) = cursor.next().await {
            match result {
                Ok(document) => {
                    let movement = from_bson::<MovementModel>(Bson::Document(document));
                    match movement {
                        Ok(result) => vec.push(result),
                        Err(e) => println!("Error parsing movement: {:?}", e),
                    }
                }
                Err(e) => println!("Error reading movement: {:?}", e),
            }
        }

        Ok(vec)
    }

    pub async fn get_movement_by_id(
        &self,
        user_id: String,
        movement_id: String,
    ) -> Result<MovementModel, AppError> {
        let movement = self
            .find_movement_by_id(user_id.to_owned(), movement_id)
            .await
            .map_err(|err| AppError::DbError(err.to_string()))?;

        match movement {
            Some(_) => Ok(movement.unwrap()),
            None => Err(AppError::NotFound("Entity not found".to_string())),
        }
    }

    pub async fn create_movement(
        &self,
        user_id: String,
        movement: CreateMovement,
    ) -> Result<MovementModel, AppError> {
        let measurement = movement.measurement.to_owned();
        if !VALID_MEASUREMENTS.contains(&measurement.as_str()) {
            return Err(AppError::UnprocessableEntity(format!(
                "Invalid measurement, should be one of: {}",
                VALID_MEASUREMENTS.join(", ")
            )));
        }

        let movement_name = movement.name.to_string();
        let _exist = self
            .find_movement_by_name(user_id.to_owned(), movement_name.to_owned())
            .await
            .unwrap();
        match _exist {
            Some(_) => Err(AppError::Conflict(
                "Movement with this name already exists".to_string(),
            )),
            None => {
                let coll = self.get_movement_collection();
                let id = uuid::Uuid::new_v4().to_string();
                let now = Utc::now().to_rfc3339();
                let movement_doc = doc! {
                    "movement_id": id,
                    "user_id": user_id.to_owned(),
                    "name": movement.name,
                    "measurement": movement.measurement,
                    "global": movement.global,
                    "created_at": now.to_owned(),
                    "updated_at": now.to_owned(),
                };

                let _ = coll
                    .insert_one(movement_doc, None)
                    .await
                    .map_err(|err| AppError::DbError(err.to_string()));

                match self
                    .find_movement_by_name(user_id.to_owned(), movement_name.to_owned())
                    .await
                    .unwrap()
                {
                    Some(new_movement) => Ok(new_movement),
                    None => Err(AppError::DbError(
                        "New movement not found after inserting".to_string(),
                    )),
                }
            }
        }
    }
}
