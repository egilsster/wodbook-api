use crate::models::workout::{
    CreateWorkout, CreateWorkoutScore, UpdateWorkout, UpdateWorkoutScore, WorkoutModel,
    WorkoutScoreModel,
};
use crate::utils::{query_utils, Config};
use crate::{
    errors::{AppError, WebResult},
    models::workout::WorkoutMeasurement,
};

use chrono::Utc;
use futures::stream::StreamExt;
use mongodb::options::FindOptions;
use mongodb::{Client, Collection};
use std::vec::Vec;

static WORKOUT_COLLECTION_NAME: &str = "workouts";
static SCORE_COLLECTION_NAME: &str = "workoutscores";

pub struct WorkoutRepository {
    pub mongo_client: Client,
}

impl WorkoutRepository {
    fn get_score_collection(&self) -> Collection<WorkoutScoreModel> {
        let config = Config::from_env().unwrap();
        let database_name = config.mongo.db_name;
        let db = self.mongo_client.database(database_name.as_str());
        db.collection(SCORE_COLLECTION_NAME)
    }

    fn get_workout_collection(&self) -> Collection<WorkoutModel> {
        let config = Config::from_env().unwrap();
        let database_name = config.mongo.db_name;
        let db = self.mongo_client.database(database_name.as_str());
        db.collection(WORKOUT_COLLECTION_NAME)
    }

    pub async fn find_workout_by_name(
        &self,
        user_id: &str,
        name: &str,
    ) -> WebResult<Option<WorkoutModel>> {
        let query = query_utils::for_one(doc! {"name": name }, user_id);

        match self.get_workout_collection().find_one(query, None).await {
            Ok(workout) => Ok(workout),
            Err(e) => Err(AppError::Internal(e.to_string())),
        }
    }

    pub async fn find_workout_by_id(
        &self,
        user_id: &str,
        workout_id: &str,
    ) -> WebResult<Option<WorkoutModel>> {
        let query = query_utils::for_one(doc! {"workout_id": workout_id }, user_id);
        let cursor = self.get_workout_collection().find_one(query, None).await;

        match cursor {
            Ok(workout) => Ok(workout),
            Err(e) => Err(AppError::Internal(e.to_string())),
        }
    }

    pub async fn get_workouts(&self, user_id: &str) -> WebResult<Vec<WorkoutModel>> {
        let query = query_utils::for_many(user_id);
        let find_options = FindOptions::builder().sort(doc! { "name": 1 }).build();
        let mut cursor = self
            .get_workout_collection()
            .find(query, find_options)
            .await?;

        let mut vec: Vec<WorkoutModel> = Vec::new();

        while let Some(result) = cursor.next().await {
            if let Ok(result) = result {
                vec.push(result);
            } else {
                warn!("Error reading workout: {:?}", result.unwrap_err())
            }
        }

        Ok(vec)
    }

    pub async fn get_workout_by_id(
        &self,
        user_id: &str,
        workout_id: &str,
    ) -> WebResult<WorkoutModel> {
        match self.find_workout_by_id(user_id, workout_id).await? {
            Some(workout) => Ok(workout),
            None => Err(AppError::NotFound(
                "Workout with this id does not exist".to_string(),
            )),
        }
    }

    pub async fn create_workout(
        &self,
        user_id: &str,
        workout: CreateWorkout,
    ) -> WebResult<WorkoutModel> {
        let workout_name = workout.name.as_ref();
        let existing_workout = self.find_workout_by_name(user_id, workout_name).await?;

        if existing_workout.is_some() {
            return Err(AppError::Conflict(
                "A workout with this name already exists".to_string(),
            ));
        }

        let coll = self.get_workout_collection();
        let id = uuid::Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();
        let workout = WorkoutModel {
            workout_id: id,
            user_id: user_id.to_owned(),
            name: workout.name.to_owned(),
            description: workout.description,
            measurement: workout.measurement,
            is_public: workout.is_public,
            created_at: now.to_owned(),
            updated_at: now,
        };

        coll.insert_one(workout, None).await?;

        match self.find_workout_by_name(user_id, workout_name).await? {
            Some(new_workout) => Ok(new_workout),
            None => Err(AppError::Internal(
                "New workout not found after inserting".to_string(),
            )),
        }
    }

    pub async fn update_workout(
        &self,
        user_id: &str,
        workout_id: &str,
        workout_update: UpdateWorkout,
    ) -> WebResult<WorkoutModel> {
        let existing_workout = self.find_workout_by_id(user_id, workout_id).await?;

        if existing_workout.is_none() {
            return Err(AppError::NotFound("Workout not found".to_owned()));
        }

        let existing_workout = existing_workout.unwrap();

        let new_name = workout_update.name.unwrap_or(existing_workout.name);
        let new_desc = workout_update
            .description
            .unwrap_or(existing_workout.description);

        // Check if there exists a workout with the new name
        let conflicting_workout = self.find_workout_by_name(user_id, &new_name).await?;

        if conflicting_workout.is_some() {
            return Err(AppError::Conflict(
                "Workout with this name already exists".to_owned(),
            ));
        }

        let query = doc! { "workout_id": workout_id };
        let update = doc! {
            "$set": {
                "name": new_name,
                "description": new_desc,
                "updated_at": Utc::now().to_rfc3339()
            }
        };

        let coll = self.get_workout_collection();
        coll.update_one(query, update, None).await?;

        let model = self.find_workout_by_id(user_id, workout_id).await?.unwrap();

        Ok(model)
    }

    pub async fn delete_workout(&self, user_id: &str, workout_id: &str) -> WebResult<()> {
        let workout = self.find_workout_by_id(user_id, workout_id).await?;

        if workout.is_none() {
            return Err(AppError::NotFound("Workout does not exist".to_owned()));
        }

        let coll = self.get_workout_collection();
        coll.delete_one(doc! { "workout_id": workout_id }, None)
            .await?;

        self.delete_workout_scores(user_id, workout_id).await?;

        Ok(())
    }

    pub async fn create_workout_score(
        &self,
        user_id: &str,
        workout: &WorkoutModel,
        workout_score: CreateWorkoutScore,
    ) -> WebResult<WorkoutScoreModel> {
        let coll = self.get_score_collection();
        let id = uuid::Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();
        let workout_id = workout.workout_id.to_owned();
        let workout_score = WorkoutScoreModel {
            workout_score_id: id.to_owned(),
            workout_id: workout_id.to_owned(),
            user_id: user_id.to_owned(),
            score: workout_score.score,
            rx: workout_score.rx,
            notes: workout_score.notes,
            // This is for mywod items, as they have their own created at date which prefer to keep
            created_at: workout_score.created_at.unwrap_or_else(|| now.to_owned()),
            updated_at: now.to_owned(),
        };

        coll.insert_one(workout_score, None).await?;
        self.get_workout_score_by_id(user_id, &workout_id, &id)
            .await
    }

    pub async fn get_workout_scores_with_query(
        &self,
        query: bson::Document,
        find_options: FindOptions,
    ) -> WebResult<Vec<WorkoutScoreModel>> {
        let mut cursor = self
            .get_score_collection()
            .find(query, find_options)
            .await
            .unwrap();

        let mut vec: Vec<WorkoutScoreModel> = Vec::new();

        while let Some(result) = cursor.next().await {
            match result {
                Ok(document) => vec.push(document),
                Err(e) => warn!("Error reading workout: {:?}", e),
            }
        }

        Ok(vec)
    }

    pub async fn get_workout_scores_for_user(
        &self,
        user_id: &str,
    ) -> WebResult<Vec<WorkoutScoreModel>> {
        let query = query_utils::for_many_with_filter(doc! { "user_id": user_id }, user_id);
        let find_options: FindOptions = FindOptions::builder()
            .sort(doc! { "created_at": 1 })
            .build();

        self.get_workout_scores_with_query(query, find_options)
            .await
    }

    pub async fn get_workout_scores_for_workout(
        &self,
        user_id: &str,
        workout: &WorkoutModel,
    ) -> WebResult<Vec<WorkoutScoreModel>> {
        let query = query_utils::for_many_with_filter(
            doc! { "user_id": user_id, "workout_id": &workout.workout_id },
            user_id,
        );

        // ascending for timed, descending for the rest
        let score_filter = doc! {
            "score": if workout.measurement == WorkoutMeasurement::Time { 1 } else { -1 },
            "rx": -1,
        };
        let find_options = FindOptions::builder().sort(score_filter).build();

        self.get_workout_scores_with_query(query, find_options)
            .await
    }

    pub async fn get_workout_score_by_id(
        &self,
        user_id: &str,
        workout_id: &str,
        workout_score_id: &str,
    ) -> WebResult<WorkoutScoreModel> {
        let query = query_utils::for_one(
            doc! { "workout_id":  workout_id, "workout_score_id": workout_score_id },
            user_id,
        );
        let cursor = self.get_score_collection().find_one(query, None).await?;

        match cursor {
            Some(model) => Ok(model),
            None => Err(AppError::NotFound("Entity not found".to_string())),
        }
    }

    pub async fn update_workout_score_by_id(
        &self,
        user_id: &str,
        workout_id: &str,
        workout_score_id: &str,
        new_score: UpdateWorkoutScore,
    ) -> WebResult<WorkoutScoreModel> {
        let score = self
            .get_workout_score_by_id(user_id, workout_id, workout_score_id)
            .await?;

        let updated_score = new_score.score.unwrap_or(score.score);
        let updated_rx = new_score.rx.unwrap_or(score.rx);
        let updated_notes = new_score.notes.unwrap_or(score.notes);
        let updated_updated_at = Utc::now().to_rfc3339();

        let query = query_utils::for_one(doc! { "workout_score_id": workout_score_id }, user_id);
        let update = doc! {
            "$set": {
                "score": updated_score,
                "rx": updated_rx,
                "notes": updated_notes,
                "updated_at": updated_updated_at,
            }
        };

        let _ = self
            .get_score_collection()
            .update_one(query, update, None)
            .await?;

        let res = self
            .get_workout_score_by_id(user_id, workout_id, workout_score_id)
            .await?;

        Ok(res)
    }

    pub async fn delete_workout_score_by_id(
        &self,
        user_id: &str,
        workout_id: &str,
        workout_score_id: &str,
    ) -> WebResult<()> {
        // Ensure the score exists for the user
        self.get_workout_score_by_id(user_id, workout_id, workout_score_id)
            .await?;

        let query = query_utils::for_one(doc! { "workout_score_id": workout_score_id }, user_id);
        self.get_score_collection().delete_one(query, None).await?;

        Ok(())
    }

    async fn delete_workout_scores(&self, user_id: &str, workout_id: &str) -> WebResult<()> {
        let query = query_utils::for_many_with_filter(doc! { "workout_id": workout_id }, user_id);
        self.get_score_collection().delete_many(query, None).await?;

        Ok(())
    }
}
