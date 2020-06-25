use crate::errors::AppError;
use crate::models::movement::CreateMovement;
use crate::models::mywod::{Athlete, CustomWOD, Movement, MovementSession, MyWOD};
use crate::models::user::UpdateUser;
use crate::models::workout::CreateWorkout;
use crate::repositories::{MovementRepository, UserRepository, WorkoutRepository};
use crate::utils::mywod::{
    get_scores_for_movement, map_movement_measurement, map_workout_measurement,
    parse_workout_score, save_avatar,
};

pub async fn save_athlete(
    user_repo: UserRepository,
    user_id: &str,
    user_email: &str,
    athlete: Athlete,
) -> Result<bool, AppError> {
    let avatar_url = save_avatar(user_id, athlete.avatar).unwrap();

    let user_update = UpdateUser {
        password: None,
        first_name: Some(athlete.first_name.trim().to_owned()),
        last_name: Some(athlete.last_name.trim().to_owned()),
        date_of_birth: Some(athlete.date_of_birth),
        height: Some(athlete.height),
        weight: Some(athlete.weight),
        box_name: Some(athlete.box_name.trim().to_owned()),
        avatar_url: Some(avatar_url),
    };

    let updated_user = user_repo
        .update_user_with_email(user_email, user_update)
        .await;

    Ok(updated_user.is_ok())
}

pub async fn save_workouts_and_scores(
    workout_repo: WorkoutRepository,
    workouts: Vec<CustomWOD>,
    workout_scores: &[MyWOD],
    user_id: &str,
) -> Result<(u32, u32), AppError> {
    let mut added_workouts = 0u32;
    let mut added_scores = 0u32;

    for workout in workouts {
        let new_workout = CreateWorkout {
            name: workout.title,
            description: workout.description,
            measurement: map_workout_measurement(workout.score_type.as_ref()),
            public: false,
        };
        let created_workout = workout_repo.create_workout(user_id, new_workout).await;
        if created_workout.is_ok() {
            added_workouts += 1;
        }
    }

    // TODO: Fix duplication with workout scores
    for score in workout_scores {
        let workout_title = score.title.to_owned();
        let workout_description = score.description.to_owned();

        let mut workout = workout_repo
            .find_workout_by_name(user_id, &workout_title)
            .await?;

        if workout.is_none() {
            let new_workout = CreateWorkout {
                name: workout_title,
                description: workout_description,
                measurement: map_workout_measurement(&score.score_type),
                public: false,
            };
            workout = Some(workout_repo.create_workout(user_id, new_workout).await?);
            added_workouts += 1;
        }

        if workout.is_some() {
            let workout = workout.unwrap();
            let score_data = parse_workout_score(score);
            let added_score = workout_repo
                .create_workout_score(user_id, &workout.workout_id, score_data)
                .await;
            if added_score.is_ok() {
                added_scores += 1;
            }
        }
    }

    Ok((added_workouts, added_scores))
}

pub async fn save_movements_and_scores(
    movement_repo: MovementRepository,
    movements: &[Movement],
    movement_scores: &[MovementSession],
    user_id: &str,
) -> Result<(u32, u32), AppError> {
    let mut added_movements = 0u32;
    let mut added_movement_scores = 0u32;

    for m in movements {
        let new_movement = CreateMovement {
            name: m.name.to_owned(),
            measurement: map_movement_measurement(m.score_type),
            public: false,
        };
        let created_movement = movement_repo.create_movement(user_id, new_movement).await;
        if let Ok(created_movement) = created_movement {
            added_movements += 1;
            let all_scores = get_scores_for_movement(m, &movement_scores);
            for score in all_scores {
                movement_repo
                    .create_movement_score(user_id, &created_movement.movement_id, score)
                    .await?;
                added_movement_scores += 1;
            }
        }
    }

    Ok((added_movements, added_movement_scores))
}
