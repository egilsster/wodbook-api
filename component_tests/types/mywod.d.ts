declare type MyWodResponse = {
  statusCode: number;
  body: {
    user_updated: boolean;
    added_workouts: number;
    added_workout_scores: number;
    added_movements: number;
    added_movement_scores: number;
  };
};
