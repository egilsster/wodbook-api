use crate::errors::AppError;
use crate::models::movement::{
    CreateMovement, CreateMovementScore, MovementModel, MovementScoreResponse, UpdateMovement,
    UpdateMovementScore,
};
use crate::utils::{query_utils, Config};

use bson::{doc, from_bson, Bson};
use chrono::Utc;
use futures::stream::StreamExt;
use mongodb::options::FindOptions;
use mongodb::{Client, Collection};
use std::vec::Vec;

static WORKOUT_COLLECTION_NAME: &str = "movements";
static SCORE_COLLECTION_NAME: &str = "movementscores";

// TODO(egilsster): Can this be done with enum (and match?)?
static VALID_MEASUREMENTS: [&str; 4] = ["weight", "distance", "reps", "height"];

pub struct MovementRepository {
    pub mongo_client: Client,
}

impl MovementRepository {
    fn get_score_collection(&self) -> Collection {
        let config = Config::from_env().unwrap();
        let database_name = config.mongo.db_name;
        let db = self.mongo_client.database(database_name.as_str());
        db.collection(SCORE_COLLECTION_NAME)
    }

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

        if cursor.is_none() {
            return Ok(None);
        }

        match from_bson(Bson::Document(cursor.unwrap())) {
            Ok(model) => Ok(model),
            Err(e) => Err(AppError::Internal(e.to_string())),
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
            if let Ok(result) = result {
                let movement = from_bson::<MovementModel>(Bson::Document(result));
                match movement {
                    Ok(result) => vec.push(result),
                    Err(e) => println!("Error parsing movement: {:?}", e),
                }
            } else {
                println!("Error reading movement: {:?}", result.unwrap_err())
            }
        }

        Ok(vec)
    }

    pub async fn get_movement_by_id(
        &self,
        user_id: &str,
        movement_id: &str,
    ) -> Result<MovementModel, AppError> {
        let movement = self.find_movement_by_id(user_id, movement_id).await?;

        match movement {
            Some(_) => Ok(movement.unwrap()),
            None => Err(AppError::NotFound(
                "Movement with this id does not exist".to_string(),
            )),
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
        let existing_movement = self.find_movement_by_name(user_id, movement_name).await?;

        if existing_movement.is_some() {
            return Err(AppError::Conflict(
                "A movement with this name already exists".to_string(),
            ));
        }

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

        coll.insert_one(movement_doc, None)
            .await
            .map_err(|err| AppError::Internal(err.to_string()))?;

        match self.find_movement_by_name(user_id, movement_name).await? {
            Some(new_movement) => Ok(new_movement),
            None => Err(AppError::Internal(
                "New movement not found after inserting".to_string(),
            )),
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
            .await?
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

        self.delete_movement_scores(user_id, movement_id).await?;

        Ok(())
    }

    pub async fn create_movement_score(
        &self,
        user_id: &str,
        movement_id: &str,
        movement_score: CreateMovementScore,
    ) -> Result<MovementScoreResponse, AppError> {
        let coll = self.get_score_collection();
        let id = uuid::Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();
        let movement_score_doc = doc! {
            "movement_score_id": id.to_owned(),
            "user_id": user_id.to_owned(),
            "movement_id": movement_id.to_owned(),
            "score": movement_score.score,
            "sets": movement_score.sets,
            "reps": movement_score.reps,
            "distance": movement_score.distance,
            "notes": movement_score.notes,
            "created_at": movement_score.created_at.unwrap_or_else(|| now.to_owned()),
            "updated_at": now.to_owned(),
        };

        coll.insert_one(movement_score_doc, None)
            .await
            .map_err(|err| AppError::Internal(err.to_string()))?;

        self.get_movement_score_by_id(user_id, movement_id, &id)
            .await
    }

    pub async fn get_movement_scores(
        &self,
        user_id: &str,
        movement_id: &str,
    ) -> Result<Vec<MovementScoreResponse>, AppError> {
        let query = query_utils::for_many_with_filter(
            doc! { "user_id": user_id, "movement_id": movement_id },
            user_id,
        );
        let find_options = FindOptions::builder()
            .sort(doc! { "created_at": 1 })
            .build();
        let mut cursor = self
            .get_score_collection()
            .find(query, find_options)
            .await
            .unwrap();

        let mut vec: Vec<MovementScoreResponse> = Vec::new();

        while let Some(result) = cursor.next().await {
            match result {
                Ok(document) => {
                    let movement_score =
                        from_bson::<MovementScoreResponse>(Bson::Document(document));
                    match movement_score {
                        Ok(result) => vec.push(result),
                        Err(e) => println!("Error parsing movement: {:?}", e),
                    }
                }
                Err(e) => println!("Error reading movement: {:?}", e),
            }
        }

        Ok(vec)
    }

    pub async fn get_movement_score_by_id(
        &self,
        user_id: &str,
        movement_id: &str,
        movement_score_id: &str,
    ) -> Result<MovementScoreResponse, AppError> {
        let query = query_utils::for_one(
            doc! { "movement_id":  movement_id, "movement_score_id": movement_score_id },
            user_id,
        );
        let cursor = self
            .get_score_collection()
            .find_one(query, None)
            .await
            .map_err(|err| AppError::Internal(err.to_string()))?;

        if cursor.is_none() {
            return Err(AppError::NotFound("Entity not found".to_string()));
        }

        match from_bson(Bson::Document(cursor.unwrap())) {
            Ok(model) => Ok(model),
            Err(err) => Err(AppError::Internal(err.to_string())),
        }
    }

    pub async fn update_movement_score_by_id(
        &self,
        user_id: &str,
        movement_id: &str,
        movement_score_id: &str,
        new_score: UpdateMovementScore,
    ) -> Result<MovementScoreResponse, AppError> {
        let mut score = self
            .get_movement_score_by_id(user_id, movement_id, movement_score_id)
            .await?;

        let now = Utc::now().to_rfc2822();

        score.score = new_score.score.unwrap_or(score.score);
        score.reps = new_score.reps.unwrap_or(score.reps);
        score.sets = new_score.sets.unwrap_or(score.sets);
        score.notes = new_score.notes.unwrap_or(score.notes);
        score.distance = new_score.distance.unwrap_or(score.distance);
        score.updated_at = now;

        let movement_doc = score.to_doc(user_id);

        let query = query_utils::for_one(doc! { "movement_score_id": movement_score_id }, user_id);
        let update_result = self
            .get_score_collection()
            .update_one(query, movement_doc, None)
            .await;

        if update_result.is_err() {
            return Err(AppError::Internal(
                "Something went wrong when inserting a score.".to_owned(),
            ));
        }

        let res = self
            .get_movement_score_by_id(user_id, movement_id, movement_score_id)
            .await;

        if res.is_err() {
            return Err(AppError::Internal(
                "New score not found after inserting".to_owned(),
            ));
        }

        res
    }

    pub async fn delete_movement_score_by_id(
        &self,
        user_id: &str,
        movement_id: &str,
        movement_score_id: &str,
    ) -> Result<(), AppError> {
        // Ensure the score exists for the user
        self.get_movement_score_by_id(user_id, movement_id, movement_score_id)
            .await?;

        let query = query_utils::for_one(doc! { "movement_score_id": movement_score_id }, user_id);
        let delete_result = self.get_score_collection().delete_one(query, None).await;

        if let Err(delete_result) = delete_result {
            return Err(AppError::Internal(delete_result.to_string()));
        }

        Ok(())
    }

    async fn delete_movement_scores(
        &self,
        user_id: &str,
        movement_id: &str,
    ) -> Result<(), AppError> {
        let query = query_utils::for_many_with_filter(doc! { "movement_id": movement_id }, user_id);
        self.get_score_collection()
            .delete_many(query, None)
            .await
            .map_err(|err| AppError::Internal(err.to_string()))?;

        Ok(())
    }
}
