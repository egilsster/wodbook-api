type WorkoutData = {
  workout_id: string;
  user_id: string;
  name: string;
  description: string;
  measurement: string;
  public: boolean;
  scores: any[]; // TODO(egilsster): add scores for workouts
  created_at: string;
  updated_at: string;
};

type ManyWorkoutsData = {
  data: WorkoutData[];
};

declare type WorkoutResponse = {
  statusCode: number;
  body: WorkoutData;
};

declare type ManyWorkoutsResponse = {
  statusCode: number;
  body: ManyWorkoutsData;
};
