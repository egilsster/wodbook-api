use crate::errors::AppError;
use crate::models::movement::{CreateMovementScore, MovementScoreResponse};
use crate::utils::Config;

use bson::{doc, from_bson, Bson};
use chrono::Utc;
use futures::stream::StreamExt;
use mongodb::options::FindOptions;
use mongodb::{Client, Collection};
use std::vec::Vec;

static SCORE_COLLECTION_NAME: &'static str = "movementscores";

pub struct MovementScoreRepository {
    pub mongo_client: Client,
}

impl MovementScoreRepository {
    fn get_score_collection(&self) -> Collection {
        let config = Config::from_env().unwrap();
        let database_name = config.mongo.db_name;
        let db = self.mongo_client.database(database_name.as_str());
        db.collection(SCORE_COLLECTION_NAME)
    }

    pub async fn create_movement_score(
        &self,
        user_id: String,
        movement_id: String,
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
            "created_at": now.to_owned(),
            "updated_at": now.to_owned(),
        };

        let _ = coll
            .insert_one(movement_score_doc, None)
            .await
            .map_err(|err| AppError::Internal(err.to_string()));

        self.get_movement_score_by_id(user_id.to_owned(), movement_id.to_owned(), id.to_owned())
            .await
            .map_err(|_| AppError::Internal("Score not found after inserting".to_string()))
    }

    pub async fn get_movement_scores(
        &self,
        user_id: String,
        movement_id: String,
    ) -> Result<Vec<MovementScoreResponse>, AppError> {
        let filter = doc! { "user_id": user_id, "movement_id": movement_id };
        let find_options = FindOptions::builder()
            .sort(doc! { "created_at": 1 })
            .build();
        let mut cursor = self
            .get_score_collection()
            .find(filter, find_options)
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
        user_id: String,
        movement_id: String,
        movement_score_id: String,
    ) -> Result<MovementScoreResponse, AppError> {
        let filter = doc! { "user_id": user_id, "movement_id":  movement_id, "movement_score_id": movement_score_id };
        let cursor = self
            .get_score_collection()
            .find_one(filter, None)
            .await
            .map_err(|err| AppError::Internal(err.to_string()))?;

        match cursor {
            Some(doc) => match from_bson(Bson::Document(doc)) {
                Ok(model) => Ok(model),
                Err(err) => Err(AppError::Internal(err.to_string())),
            },
            None => Err(AppError::NotFound("Entity not found".to_string())),
        }
    }

    // pub async fn update_movement_score_by_id(
    //     &self,
    //     user_id: String,
    // ) -> Result<Option<MovementScoreResponse>, ErrorResponse> {
    //     let _exist = self
    //         .find_movement_by_id(user_id.to_owned(), movement_id.to_owned())
    //         .await
    //         .unwrap();

    //     match _exist {
    //         Some(_) => Err(ErrorResponse {
    //             message: "Movement not found.".to_string(),
    //             status: StatusCode::NOT_FOUND.as_u16(),
    //         }),
    //         None => {
    //             let coll = self.get_collection();
    //             let id = uuid::Uuid::new_v4().to_string();
    //             let now = Utc::now().to_rfc2822();
    //             let movement_doc = doc! {
    //                 "movement_id": id,
    //                 "user_id": user_id.to_owned(),
    //                 "name": movement.name,
    //                 "description": movement.description,
    //                 "measurement": movement.measurement,
    //                 "global": movement.global,
    //                 "created_at": now.to_owned(),
    //                 "updated_at": now.to_owned(),
    //             };

    //             match coll.insert_one(movement_doc, None).await {
    //                 Ok(_) => {
    //                     match self
    //                         .find_movement_by_name(user_id.to_owned(), movement_name.to_owned())
    //                         .await
    //                         .unwrap()
    //                     {
    //                         Some(new_movement) => Ok(new_movement),
    //                         None => Err(ErrorResponse {
    //                             message: "New movement not found after inserting".to_string(),
    //                             status: StatusCode::INTERNAL_SERVER_ERROR.as_u16(),
    //                         }),
    //                     }
    //                 }
    //                 Err(_) => Err(ErrorResponse {
    //                     message: "Something went wrong when inserting a movement.".to_string(),
    //                     status: StatusCode::INTERNAL_SERVER_ERROR.as_u16(),
    //                 }),
    //             }
    //         }
    //     }
    // }
}
