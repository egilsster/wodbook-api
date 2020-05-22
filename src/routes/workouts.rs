use crate::db::connection::Connection;
use crate::models::user::Claims;
use crate::models::workout::{
    CreateWorkout, CreateWorkoutScore, ManyWorkoutsResponse, WorkoutResponse,
};
use crate::repositories::workout_repository::{WorkoutRepository, WorkoutScoreRepository};
use actix_web::http::StatusCode;
use actix_web::{get, post, web, HttpResponse};

#[get("/")]
async fn get_workouts(claims: Claims) -> HttpResponse {
    let _connection = Connection.init().await.unwrap();
    let _repository: WorkoutRepository = WorkoutRepository {
        connection: _connection,
    };
    let user_id = claims.user_id.to_owned();
    let proc = _repository.get_workouts(user_id).await;

    match proc {
        Ok(res) => HttpResponse::Ok().json(ManyWorkoutsResponse { data: res }),
        Err(err) => HttpResponse::Ok()
            .status(StatusCode::from_u16(err.status).unwrap())
            .json(err),
    }
}

#[post("/")]
async fn create_workout(claims: Claims, workout: web::Json<CreateWorkout>) -> HttpResponse {
    let _connection = Connection.init().await.unwrap();
    let _repository: WorkoutRepository = WorkoutRepository {
        connection: _connection,
    };
    let user_id = claims.user_id.to_owned();
    let proc = _repository
        .create_workout(user_id, workout.into_inner())
        .await;

    match proc {
        Ok(res) => HttpResponse::Created().json(res),
        Err(err) => HttpResponse::Ok()
            .status(StatusCode::from_u16(err.status).unwrap())
            .json(err),
    }
}

#[get("/{id}")]
async fn get_workout_by_id(info: web::Path<String>, claims: Claims) -> HttpResponse {
    let workout_repo = WorkoutRepository {
        connection: Connection.init().await.unwrap(),
    };
    let score_repo = WorkoutScoreRepository {
        connection: Connection.init().await.unwrap(),
    };
    let workout_id = info.to_owned();
    let user_id = claims.user_id.to_owned();
    let workout = workout_repo
        .get_workout_by_id(user_id.to_owned(), workout_id.to_owned())
        .await;
    let scores = score_repo
        .get_workout_scores(user_id.to_owned(), workout_id.to_owned())
        .await;

    match workout {
        Ok(res) => match scores {
            Ok(workout_scores) => {
                let w = WorkoutResponse::from_model(res, workout_scores);
                HttpResponse::Ok().json(w)
            }
            Err(err) => HttpResponse::Ok()
                .status(StatusCode::from_u16(err.status).unwrap())
                .json(err),
        },
        Err(err) => HttpResponse::Ok()
            .status(StatusCode::from_u16(err.status).unwrap())
            .json(err),
    }
}

#[post("/{id}")]
async fn create_workout_score(
    info: web::Path<String>,
    claims: Claims,
    workout_score: web::Json<CreateWorkoutScore>,
) -> HttpResponse {
    let _connection = Connection.init().await.unwrap();
    let score_repo: WorkoutScoreRepository = WorkoutScoreRepository {
        connection: _connection,
    };
    let workout_id = info.to_owned();
    let user_id = claims.user_id.to_owned();
    let proc = score_repo
        .create_workout_score(user_id, workout_id, workout_score.into_inner())
        .await;

    match proc {
        Ok(res) => HttpResponse::Created().json(res),
        Err(err) => HttpResponse::Ok()
            .status(StatusCode::from_u16(err.status).unwrap())
            .json(err),
    }
}

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_workouts);
    cfg.service(create_workout);
    cfg.service(get_workout_by_id);
    cfg.service(create_workout_score);
}
