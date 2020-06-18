use crate::errors::AppError;
use crate::models::workout::{CreateWorkout, UpdateWorkout, WorkoutModel};
use crate::utils::{query_utils, Config};

use bson::{doc, from_bson, Bson};
use chrono::Utc;
use futures::stream::StreamExt;
use mongodb::options::FindOptions;
use mongodb::{Client, Collection};
use std::vec::Vec;

static WORKOUT_COLLECTION_NAME: &str = "workouts";

// TODO(egilsster): Can this be done with enum (and match?)?
static VALID_MEASUREMENTS: [&str; 9] = [
    "time",
    "distance",
    "load",
    "repetitions",
    "rounds",
    "timed_rounds",
    "tabata",
    "total",
    "none",
];

pub struct WorkoutRepository {
    pub mongo_client: Client,
}

impl WorkoutRepository {
    fn get_workout_collection(&self) -> Collection {
        let config = Config::from_env().unwrap();
        let database_name = config.mongo.db_name;
        let db = self.mongo_client.database(database_name.as_str());
        db.collection(WORKOUT_COLLECTION_NAME)
    }

    pub async fn find_workout_by_name(
        &self,
        user_id: &str,
        name: &str,
    ) -> Result<Option<WorkoutModel>, AppError> {
        let query = query_utils::for_one(doc! {"name": name }, user_id);
        let cursor = self
            .get_workout_collection()
            .find_one(query, None)
            .await
            .unwrap();

        match cursor {
            Some(doc) => match from_bson(Bson::Document(doc)) {
                Ok(model) => Ok(model),
                Err(e) => Err(AppError::Internal(e.to_string())),
            },
            None => Ok(None),
        }
    }

    pub async fn find_workout_by_id(
        &self,
        user_id: &str,
        workout_id: &str,
    ) -> Result<Option<WorkoutModel>, AppError> {
        let query = query_utils::for_one(doc! {"workout_id": workout_id }, user_id);
        let cursor = self
            .get_workout_collection()
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

    pub async fn get_workouts(&self, user_id: &str) -> Result<Vec<WorkoutModel>, AppError> {
        let query = query_utils::for_many(user_id);
        let find_options = FindOptions::builder().sort(doc! { "name": 1 }).build();
        let mut cursor = self
            .get_workout_collection()
            .find(query, find_options)
            .await
            .unwrap();

        let mut vec: Vec<WorkoutModel> = Vec::new();

        while let Some(result) = cursor.next().await {
            match result {
                Ok(document) => {
                    let workout = from_bson::<WorkoutModel>(Bson::Document(document));
                    match workout {
                        Ok(result) => vec.push(result),
                        Err(e) => println!("Error parsing workout: {:?}", e),
                    }
                }
                Err(e) => println!("Error reading workout: {:?}", e),
            }
        }

        Ok(vec)
    }

    pub async fn get_workout_by_id(
        &self,
        user_id: &str,
        workout_id: &str,
    ) -> Result<WorkoutModel, AppError> {
        let workout = self.find_workout_by_id(user_id, workout_id).await.unwrap();

        match workout {
            Some(_) => Ok(workout.unwrap()),
            None => Err(AppError::NotFound(
                "Workout by this id does not exist".to_string(),
            )),
        }
    }

    pub async fn create_workout(
        &self,
        user_id: &str,
        workout: CreateWorkout,
    ) -> Result<WorkoutModel, AppError> {
        let measurement = workout.measurement.to_owned();
        if !VALID_MEASUREMENTS.contains(&measurement.as_str()) {
            return Err(AppError::UnprocessableEntity(format!(
                "Invalid measurement, should be one of: {}",
                VALID_MEASUREMENTS.join(", ")
            )));
        }

        let workout_name = workout.name.as_ref();
        let _exist = self
            .find_workout_by_name(user_id, workout_name)
            .await
            .unwrap();
        match _exist {
            Some(_) => Err(AppError::Conflict(format!(
                "A workout with the name '{}' already exists, please enter another one",
                workout_name
            ))),
            None => {
                let coll = self.get_workout_collection();
                let id = uuid::Uuid::new_v4().to_string();
                let now = Utc::now().to_rfc3339();
                let workout_doc = doc! {
                    "workout_id": id,
                    "user_id": user_id.to_owned(),
                    "name": workout.name.to_owned(),
                    "description": workout.description,
                    "measurement": workout.measurement,
                    "public": workout.public,
                    "created_at": now.to_owned(),
                    "updated_at": now,
                };

                match coll.insert_one(workout_doc, None).await {
                    Ok(_) => {
                        match self
                            .find_workout_by_name(user_id, workout_name)
                            .await
                            .unwrap()
                        {
                            Some(new_workout) => Ok(new_workout),
                            None => Err(AppError::Internal(
                                "New workout not found after inserting".to_string(),
                            )),
                        }
                    }
                    Err(err) => Err(AppError::Internal(err.to_string())),
                }
            }
        }
    }

    pub async fn update_workout(
        &self,
        user_id: &str,
        workout_id: &str,
        workout_update: UpdateWorkout,
    ) -> Result<WorkoutModel, AppError> {
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

        let now = Utc::now().to_rfc3339();
        let workout_doc = doc! {
            "workout_id": existing_workout.workout_id,
            "user_id": user_id,
            "name": new_name,
            "description": new_desc,
            "measurement": existing_workout.measurement,
            "public": existing_workout.public,
            "created_at": existing_workout.created_at,
            "updated_at": now,
        };

        let coll = self.get_workout_collection();
        coll.update_one(doc! { "workout_id": workout_id }, workout_doc, None)
            .await
            .map_err(|_| AppError::Internal("Could not update workout".to_owned()))?;

        let model = self
            .find_workout_by_id(user_id, workout_id)
            .await
            .map_err(|err| AppError::Internal(err.to_string()))?
            .unwrap();

        Ok(model)
    }

    pub async fn delete_workout(&self, user_id: &str, workout_id: &str) -> Result<(), AppError> {
        let workout = self.find_workout_by_id(user_id, workout_id).await?;

        if workout.is_none() {
            return Err(AppError::NotFound("Workout does not exist".to_owned()));
        }

        let coll = self.get_workout_collection();
        coll.delete_one(doc! { "workout_id": workout_id }, None)
            .await
            .map_err(|_| AppError::Internal("Workout could not be deleted".to_owned()))?;

        Ok(())
    }
}
