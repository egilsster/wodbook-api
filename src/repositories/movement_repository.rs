use crate::errors::AppError;
use crate::models::movement::{CreateMovement, MovementModel, UpdateMovement};
use crate::utils::{query_utils, Config};

use bson::{doc, from_bson, Bson};
use chrono::Utc;
use futures::stream::StreamExt;
use mongodb::options::FindOptions;
use mongodb::{Client, Collection};
use std::vec::Vec;

static WORKOUT_COLLECTION_NAME: &str = "movements";

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
        user_id: &str,
        name: &str,
    ) -> Result<Option<MovementModel>, AppError> {
        let query = query_utils::for_one(doc! {"name": name }, user_id);
        let cursor = self
            .get_movement_collection()
            .find_one(query, None)
            .await
            .map_err(|err| AppError::Internal(err.to_string()))?;

        match cursor {
            Some(doc) => match from_bson(Bson::Document(doc)) {
                Ok(model) => Ok(model),
                Err(e) => Err(AppError::Internal(e.to_string())),
            },
            None => Ok(None),
        }
    }

    pub async fn find_movement_by_id(
        &self,
        user_id: &str,
        movement_id: &str,
    ) -> Result<Option<MovementModel>, AppError> {
        let query = query_utils::for_one(doc! {"movement_id": movement_id }, user_id);
        let cursor = self
            .get_movement_collection()
            .find_one(query, None)
            .await
            .map_err(|err| AppError::Internal(err.to_string()))?;

        match cursor {
            Some(doc) => match from_bson(Bson::Document(doc)) {
                Ok(model) => Ok(model),
                Err(e) => Err(AppError::Internal(e.to_string())),
            },
            None => Ok(None),
        }
    }

    pub async fn get_movements(&self, user_id: &str) -> Result<Vec<MovementModel>, AppError> {
        let query = query_utils::for_many(user_id);
        let find_options = FindOptions::builder().sort(doc! { "name": 1 }).build();
        let mut cursor = self
            .get_movement_collection()
            .find(query, find_options)
            .await
            .map_err(|err| AppError::Internal(err.to_string()))?;

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
        user_id: &str,
        movement_id: &str,
    ) -> Result<MovementModel, AppError> {
        let movement = self
            .find_movement_by_id(user_id, movement_id)
            .await
            .map_err(|err| AppError::Internal(err.to_string()))?;

        match movement {
            Some(_) => Ok(movement.unwrap()),
            None => Err(AppError::NotFound("Entity not found".to_string())),
        }
    }

    pub async fn create_movement(
        &self,
        user_id: &str,
        movement: CreateMovement,
    ) -> Result<MovementModel, AppError> {
        let measurement = movement.measurement.to_owned();
        if !VALID_MEASUREMENTS.contains(&measurement.as_str()) {
            return Err(AppError::UnprocessableEntity(format!(
                "Invalid measurement, should be one of: {}",
                VALID_MEASUREMENTS.join(", ")
            )));
        }

        let movement_name = movement.name.as_ref();
        let _exist = self
            .find_movement_by_name(user_id, movement_name)
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
                    "name": movement.name.to_owned(),
                    "measurement": movement.measurement,
                    "public": movement.public,
                    "created_at": now.to_owned(),
                    "updated_at": now.to_owned(),
                };

                let _ = coll
                    .insert_one(movement_doc, None)
                    .await
                    .map_err(|err| AppError::Internal(err.to_string()));

                match self
                    .find_movement_by_name(user_id, movement_name)
                    .await
                    .unwrap()
                {
                    Some(new_movement) => Ok(new_movement),
                    None => Err(AppError::Internal(
                        "New movement not found after inserting".to_string(),
                    )),
                }
            }
        }
    }

    pub async fn update_movement(
        &self,
        user_id: &str,
        movement_id: &str,
        movement_update: UpdateMovement,
    ) -> Result<MovementModel, AppError> {
        let existing_movement = self.find_movement_by_id(user_id, movement_id).await?;

        if existing_movement.is_none() {
            return Err(AppError::NotFound("Movement not found".to_owned()));
        }

        let existing_movement = existing_movement.unwrap();

        let new_name = movement_update.name.unwrap_or(existing_movement.name);

        // Check if there exists a movement with the new name
        let conflicting_movement = self.find_movement_by_name(user_id, &new_name).await?;

        if conflicting_movement.is_some() {
            return Err(AppError::Conflict(
                "Movement with this name already exists".to_owned(),
            ));
        }

        let now = Utc::now().to_rfc3339();
        let movement_doc = doc! {
            "movement_id": existing_movement.movement_id,
            "user_id": user_id.to_owned(),
            "name": new_name,
            "measurement": existing_movement.measurement,
            "public": existing_movement.public,
            "created_at": existing_movement.created_at,
            "updated_at": now.to_owned(),
        };

        let coll = self.get_movement_collection();
        coll.update_one(doc! { "movement_id": movement_id }, movement_doc, None)
            .await
            .map_err(|_| AppError::Internal("Could not update movement".to_owned()))?;

        let model = self
            .find_movement_by_id(user_id, movement_id)
            .await
            .map_err(|err| AppError::Internal(err.to_string()))?
            .unwrap();

        Ok(model)
    }

    pub async fn delete_movement(&self, user_id: &str, movement_id: &str) -> Result<(), AppError> {
        let movement = self.find_movement_by_id(user_id, movement_id).await?;

        if movement.is_none() {
            return Err(AppError::NotFound("Movement does not exist".to_owned()));
        }

        let coll = self.get_movement_collection();
        coll.delete_one(doc! { "movement_id": movement_id }, None)
            .await
            .map_err(|_| AppError::Internal("Movement could not be deleted".to_owned()))?;

        Ok(())
    }
}
