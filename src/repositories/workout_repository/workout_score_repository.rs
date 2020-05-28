use crate::errors::AppError;
use crate::models::workout::{CreateWorkoutScore, WorkoutScoreResponse};
use crate::utils::Config;

use bson::{doc, from_bson, Bson};
use chrono::Utc;
use futures::stream::StreamExt;
use mongodb::options::FindOptions;
use mongodb::{Client, Collection};
use std::vec::Vec;

static SCORE_COLLECTION_NAME: &'static str = "workoutscores";

pub struct WorkoutScoreRepository {
    pub mongo_client: Client,
}

impl WorkoutScoreRepository {
    fn get_score_collection(&self) -> Collection {
        let config = Config::from_env().unwrap();
        let database_name = config.mongo.db_name;
        let db = self.mongo_client.database(database_name.as_str());
        db.collection(SCORE_COLLECTION_NAME)
    }

    pub async fn create_workout_score(
        &self,
        user_id: String,
        workout_id: String,
        workout_score: CreateWorkoutScore,
    ) -> Result<WorkoutScoreResponse, AppError> {
        let coll = self.get_score_collection();
        let id = uuid::Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();
        let workout_score_doc = doc! {
            "workout_score_id": id.to_owned(),
            "user_id": user_id.to_owned(),
            "workout_id": workout_id.to_owned(),
            "score": workout_score.score,
            "rx": workout_score.rx,
            "created_at": now.to_owned(),
            "updated_at": now.to_owned(),
        };

        match coll.insert_one(workout_score_doc, None).await {
            Ok(_) => {
                match self
                    .get_workout_score_by_id(
                        user_id.to_owned(),
                        workout_id.to_owned(),
                        id.to_owned(),
                    )
                    .await
                    .unwrap()
                {
                    Some(new_workout_score) => Ok(new_workout_score),
                    None => Err(AppError::Internal(
                        "Score not found after inserting".to_string(),
                    )),
                }
            }
            Err(err) => Err(AppError::Internal(err.to_string())),
        }
    }

    pub async fn get_workout_scores(
        &self,
        user_id: String,
        workout_id: String,
    ) -> Result<Vec<WorkoutScoreResponse>, AppError> {
        let filter = doc! { "user_id": user_id, "workout_id": workout_id };
        let find_options = FindOptions::builder()
            .sort(doc! { "created_at": 1 })
            .build();
        let mut cursor = self
            .get_score_collection()
            .find(filter, find_options)
            .await
            .unwrap();

        let mut vec: Vec<WorkoutScoreResponse> = Vec::new();

        while let Some(result) = cursor.next().await {
            match result {
                Ok(document) => {
                    let workout_score = from_bson::<WorkoutScoreResponse>(Bson::Document(document));
                    match workout_score {
                        Ok(result) => vec.push(result),
                        Err(e) => println!("Error parsing workout: {:?}", e),
                    }
                }
                Err(e) => println!("Error reading workout: {:?}", e),
            }
        }

        Ok(vec)
    }

    pub async fn get_workout_score_by_id(
        &self,
        user_id: String,
        workout_id: String,
        workout_score_id: String,
    ) -> Result<Option<WorkoutScoreResponse>, AppError> {
        let filter = doc! { "user_id": user_id, "workout_id":  workout_id, "workout_score_id": workout_score_id };
        let cursor = self
            .get_score_collection()
            .find_one(filter, None)
            .await
            .unwrap();

        match cursor {
            Some(doc) => match from_bson(Bson::Document(doc)) {
                Ok(model) => Ok(model),
                Err(err) => Err(AppError::Internal(err.to_string())),
            },
            None => Ok(None),
        }
    }

    // pub async fn update_workout_score_by_id(
    //     &self,
    //     user_id: String,
    // ) -> Result<Option<WorkoutScoreResponse>, ErrorResponse> {
    //     let _exist = self
    //         .find_workout_by_id(user_id.to_owned(), workout_id.to_owned())
    //         .await
    //         .unwrap();

    //     match _exist {
    //         Some(_) => Err(ErrorResponse {
    //             message: "Workout not found.".to_string(),
    //             status: StatusCode::NOT_FOUND.as_u16(),
    //         }),
    //         None => {
    //             let coll = self.get_collection();
    //             let id = uuid::Uuid::new_v4().to_string();
    //             let now = Utc::now().to_rfc2822();
    //             let workout_doc = doc! {
    //                 "workout_id": id,
    //                 "user_id": user_id.to_owned(),
    //                 "name": workout.name,
    //                 "description": workout.description,
    //                 "measurement": workout.measurement,
    //                 "global": workout.global,
    //                 "created_at": now.to_owned(),
    //                 "updated_at": now.to_owned(),
    //             };

    //             match coll.insert_one(workout_doc, None).await {
    //                 Ok(_) => {
    //                     match self
    //                         .find_workout_by_name(user_id.to_owned(), workout_name.to_owned())
    //                         .await
    //                         .unwrap()
    //                     {
    //                         Some(new_workout) => Ok(new_workout),
    //                         None => Err(ErrorResponse {
    //                             message: "New workout not found after inserting".to_string(),
    //                             status: StatusCode::INTERNAL_SERVER_ERROR.as_u16(),
    //                         }),
    //                     }
    //                 }
    //                 Err(_) => Err(ErrorResponse {
    //                     message: "Something went wrong when inserting a workout.".to_string(),
    //                     status: StatusCode::INTERNAL_SERVER_ERROR.as_u16(),
    //                 }),
    //             }
    //         }
    //     }
    // }
}
