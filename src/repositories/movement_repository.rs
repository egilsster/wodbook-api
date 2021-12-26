use crate::models::movement::{
    CreateMovement, CreateMovementScore, MovementModel, MovementScoreModel, UpdateMovement,
    UpdateMovementScore,
};
use crate::utils::{query_utils, Config};
use crate::{
    errors::{AppError, WebResult},
    models::movement::MovementMeasurement,
};

use chrono::Utc;
use futures::stream::StreamExt;
use mongodb::options::FindOptions;
use mongodb::{Client, Collection};
use std::vec::Vec;

static WORKOUT_COLLECTION_NAME: &str = "movements";
static SCORE_COLLECTION_NAME: &str = "movementscores";

pub struct MovementRepository {
    pub mongo_client: Client,
}

impl MovementRepository {
    fn get_score_collection(&self) -> Collection<MovementScoreModel> {
        let config = Config::from_env().unwrap();
        let database_name = config.mongo.db_name;
        let db = self.mongo_client.database(database_name.as_str());
        db.collection(SCORE_COLLECTION_NAME)
    }

    fn get_movement_collection(&self) -> Collection<MovementModel> {
        let config = Config::from_env().unwrap();
        let database_name = config.mongo.db_name;
        let db = self.mongo_client.database(database_name.as_str());
        db.collection(WORKOUT_COLLECTION_NAME)
    }

    pub async fn find_movement_by_name(
        &self,
        user_id: &str,
        name: &str,
    ) -> WebResult<Option<MovementModel>> {
        let query = query_utils::for_one(doc! {"name": name }, user_id);

        match self.get_movement_collection().find_one(query, None).await {
            Ok(movement) => Ok(movement),
            Err(e) => Err(AppError::Internal(e.to_string())),
        }
    }

    pub async fn find_movement_by_id(
        &self,
        user_id: &str,
        movement_id: &str,
    ) -> WebResult<Option<MovementModel>> {
        let query = query_utils::for_one(doc! {"movement_id": movement_id }, user_id);

        match self.get_movement_collection().find_one(query, None).await {
            Ok(movement) => Ok(movement),
            Err(e) => Err(AppError::Internal(e.to_string())),
        }
    }

    pub async fn get_movements(&self, user_id: &str) -> WebResult<Vec<MovementModel>> {
        let query = query_utils::for_many(user_id);
        let find_options = FindOptions::builder().sort(doc! { "name": 1 }).build();
        let mut cursor = self
            .get_movement_collection()
            .find(query, find_options)
            .await?;

        let mut vec: Vec<MovementModel> = Vec::new();

        while let Some(result) = cursor.next().await {
            match result {
                Ok(result) => vec.push(result),
                // Should this really be swallowing the errors?
                // Is it because I still want to return _some_ data?
                Err(e) => warn!("Error reading movement: {:?}", e.to_string()),
            }
        }

        Ok(vec)
    }

    pub async fn get_movement_by_id(
        &self,
        user_id: &str,
        movement_id: &str,
    ) -> WebResult<MovementModel> {
        match self.find_movement_by_id(user_id, movement_id).await? {
            Some(movement) => Ok(movement),
            None => Err(AppError::NotFound(
                "Movement with this id does not exist".to_string(),
            )),
        }
    }

    pub async fn create_movement(
        &self,
        user_id: &str,
        movement: CreateMovement,
    ) -> WebResult<MovementModel> {
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
        let movement = MovementModel {
            movement_id: id,
            user_id: user_id.to_owned(),
            name: movement.name.to_owned(),
            measurement: movement.measurement,
            is_public: movement.is_public,
            created_at: now.to_owned(),
            updated_at: now.to_owned(),
        };

        coll.insert_one(movement, None).await?;

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
    ) -> WebResult<MovementModel> {
        let existing_movement = self.find_movement_by_id(user_id, movement_id).await?;

        if existing_movement.is_none() {
            return Err(AppError::NotFound("Movement not found".to_owned()));
        }

        let existing_movement = existing_movement.unwrap();
        let new_name = movement_update.name.unwrap_or(existing_movement.name);
        let new_movement = existing_movement.measurement;

        let query = doc! { "movement_id": movement_id };
        let update = doc! {
        "$set": {
                "name": new_name,
                "measurement": bson::to_bson(&new_movement).expect("Could not convert movement to bson"),
                "is_public": existing_movement.is_public.to_owned(),
                "updated_at": Utc::now().to_rfc3339()
            }
        };

        let coll = self.get_movement_collection();
        coll.update_one(query, update, None).await?;

        let model = self
            .find_movement_by_id(user_id, movement_id)
            .await?
            .unwrap();

        Ok(model)
    }

    pub async fn delete_movement(&self, user_id: &str, movement_id: &str) -> WebResult<()> {
        let movement = self.find_movement_by_id(user_id, movement_id).await?;

        if movement.is_none() {
            return Err(AppError::NotFound("Movement does not exist".to_owned()));
        }

        let coll = self.get_movement_collection();
        coll.delete_one(doc! { "movement_id": movement_id }, None)
            .await?;

        self.delete_movement_scores(user_id, movement_id).await?;

        Ok(())
    }

    pub async fn create_movement_score(
        &self,
        user_id: &str,
        movement: &MovementModel,
        movement_score: CreateMovementScore,
    ) -> WebResult<MovementScoreModel> {
        let coll = self.get_score_collection();
        let id = uuid::Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();
        let movement_id = movement.movement_id.to_owned();
        let new_score = MovementScoreModel {
            movement_score_id: id.to_owned(),
            movement_id: movement_id.to_owned(),
            user_id: user_id.to_owned(),
            score: movement_score.score,
            sets: movement_score.sets,
            reps: movement_score.reps,
            notes: movement_score.notes,
            // This is for mywod items, as they have their own created at date which prefer to keep
            created_at: movement_score.created_at.unwrap_or_else(|| now.to_owned()),
            updated_at: now.to_owned(),
        };

        coll.insert_one(new_score, None).await?;

        self.get_movement_score_by_id(user_id, &movement_id, &id)
            .await
    }

    pub async fn get_movement_scores_with_query(
        &self,
        query: bson::Document,
        find_options: FindOptions,
    ) -> WebResult<Vec<MovementScoreModel>> {
        let mut cursor = self
            .get_score_collection()
            .find(query, find_options)
            .await
            .unwrap();

        let mut vec: Vec<MovementScoreModel> = Vec::new();

        while let Some(result) = cursor.next().await {
            match result {
                Ok(document) => vec.push(document),
                Err(e) => warn!("Error reading movement: {:?}", e),
            }
        }

        Ok(vec)
    }

    pub async fn get_movement_scores_for_user(
        &self,
        user_id: &str,
    ) -> WebResult<Vec<MovementScoreModel>> {
        let query = query_utils::for_many_with_filter(doc! { "user_id": user_id }, user_id);
        let find_options: FindOptions = FindOptions::builder()
            .sort(doc! { "created_at": 1 })
            .build();

        self.get_movement_scores_with_query(query, find_options)
            .await
    }

    pub async fn get_movement_scores_for_movement(
        &self,
        user_id: &str,
        movement: &MovementModel,
    ) -> WebResult<Vec<MovementScoreModel>> {
        let query = query_utils::for_many_with_filter(
            doc! { "user_id": user_id, "movement_id": &movement.movement_id },
            user_id,
        );

        // ascending for timed, descending for the rest
        let score_filter = doc! { "score": if movement.measurement == MovementMeasurement::Time { 1 } else { -1 } };
        let find_options = FindOptions::builder().sort(score_filter).build();

        self.get_movement_scores_with_query(query, find_options)
            .await
    }

    pub async fn get_movement_score_by_id(
        &self,
        user_id: &str,
        movement_id: &str,
        movement_score_id: &str,
    ) -> WebResult<MovementScoreModel> {
        let query = query_utils::for_one(
            doc! { "movement_id":  movement_id, "movement_score_id": movement_score_id },
            user_id,
        );
        let cursor = self.get_score_collection().find_one(query, None).await?;

        match cursor {
            Some(model) => Ok(model),
            None => Err(AppError::NotFound("Entity not found".to_string())),
        }
    }

    pub async fn update_movement_score_by_id(
        &self,
        user_id: &str,
        movement_id: &str,
        movement_score_id: &str,
        new_score: UpdateMovementScore,
    ) -> WebResult<MovementScoreModel> {
        let score = self
            .get_movement_score_by_id(user_id, movement_id, movement_score_id)
            .await?;

        let updated_score = new_score.score.unwrap_or(score.score);
        let updated_reps = new_score.reps.unwrap_or(score.reps);
        let updated_sets = new_score.sets.unwrap_or(score.sets);
        let updated_notes = new_score.notes.unwrap_or(score.notes);
        let updated_updated_at = Utc::now().to_rfc3339();

        let query = query_utils::for_one(doc! { "movement_score_id": movement_score_id }, user_id);
        let update = doc! {
        "$set": {
             "score": updated_score,
                "reps": updated_reps,
                "sets": updated_sets,
                "notes": updated_notes,
                "updated_at": updated_updated_at,
            }
        };

        let _ = self
            .get_score_collection()
            .update_one(query, update, None)
            .await?;

        let res = self
            .get_movement_score_by_id(user_id, movement_id, movement_score_id)
            .await?;

        Ok(res)
    }

    pub async fn delete_movement_score_by_id(
        &self,
        user_id: &str,
        movement_id: &str,
        movement_score_id: &str,
    ) -> WebResult<()> {
        // Ensure the score exists for the user
        self.get_movement_score_by_id(user_id, movement_id, movement_score_id)
            .await?;

        let query = query_utils::for_one(doc! { "movement_score_id": movement_score_id }, user_id);
        let _ = self.get_score_collection().delete_one(query, None).await?;

        Ok(())
    }

    async fn delete_movement_scores(&self, user_id: &str, movement_id: &str) -> WebResult<()> {
        let query = query_utils::for_many_with_filter(doc! { "movement_id": movement_id }, user_id);
        self.get_score_collection().delete_many(query, None).await?;

        Ok(())
    }
}
