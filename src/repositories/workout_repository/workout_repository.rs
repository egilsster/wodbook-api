use crate::errors::AppError;
use crate::models::workout::{CreateWorkout, WorkoutModel};
use crate::utils::Config;

use bson::{doc, from_bson, Bson};
use chrono::Utc;
use futures::stream::StreamExt;
use mongodb::options::FindOptions;
use mongodb::{Client, Collection};
use std::vec::Vec;

static WORKOUT_COLLECTION_NAME: &'static str = "workouts";

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
        user_id: String,
        name: String,
    ) -> Result<Option<WorkoutModel>, AppError> {
        let filter = doc! { "$or": [ { "user_id": user_id, "name": name }, { "global": true } ] };
        let cursor = self
            .get_workout_collection()
            .find_one(filter, None)
            .await
            .unwrap();

        match cursor {
            Some(doc) => match from_bson(Bson::Document(doc)) {
                Ok(model) => Ok(model),
                Err(e) => Err(AppError::DbError(e.to_string())),
            },
            None => Ok(None),
        }
    }

    pub async fn find_workout_by_id(
        &self,
        user_id: String,
        workout_id: String,
    ) -> Result<Option<WorkoutModel>, AppError> {
        let filter = doc! { "$or": [ { "workout_id": workout_id, "user_id": user_id }, { "global": true } ] };
        let cursor = self
            .get_workout_collection()
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

    pub async fn get_workouts(&self, user_id: String) -> Result<Vec<WorkoutModel>, AppError> {
        let filter = doc! { "$or": [ { "user_id": user_id }, { "global": true } ] };
        let find_options = FindOptions::builder().sort(doc! { "name": 1 }).build();
        let mut cursor = self
            .get_workout_collection()
            .find(filter, find_options)
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
        user_id: String,
        workout_id: String,
    ) -> Result<WorkoutModel, AppError> {
        let workout = self
            .find_workout_by_id(user_id.to_owned(), workout_id)
            .await
            .unwrap();

        match workout {
            Some(_) => Ok(workout.unwrap()),
            None => Err(AppError::NotFound(
                "Workout by this id does not exist".to_string(),
            )),
        }
    }

    pub async fn create_workout(
        &self,
        user_id: String,
        workout: CreateWorkout,
    ) -> Result<WorkoutModel, AppError> {
        let measurement = workout.measurement.to_owned();
        if !VALID_MEASUREMENTS.contains(&measurement.as_str()) {
            return Err(AppError::UnprocessableEntity(format!(
                "Invalid measurement, should be one of: {}",
                VALID_MEASUREMENTS.join(", ")
            )));
        }

        let workout_name = workout.name.to_string();
        let _exist = self
            .find_workout_by_name(user_id.to_owned(), workout_name.to_owned())
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
                    "name": workout.name,
                    "description": workout.description,
                    "measurement": workout.measurement,
                    "global": workout.global,
                    "created_at": now.to_owned(),
                    "updated_at": now.to_owned(),
                };

                match coll.insert_one(workout_doc, None).await {
                    Ok(_) => {
                        match self
                            .find_workout_by_name(user_id.to_owned(), workout_name.to_owned())
                            .await
                            .unwrap()
                        {
                            Some(new_workout) => Ok(new_workout),
                            None => Err(AppError::DbError(
                                "New workout not found after inserting".to_string(),
                            )),
                        }
                    }
                    Err(err) => Err(AppError::DbError(err.to_string())),
                }
            }
        }
    }
}
