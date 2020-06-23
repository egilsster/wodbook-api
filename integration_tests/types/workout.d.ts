type WorkoutData = {
  workout_id: string;
  user_id: string;
  name: string;
  description: string;
  measurement: string;
  public: boolean;
  scores: WorkoutScoreData[];
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

type WorkoutScoreData = {
  workout_id: string;
  workout_score_id: string;
  score: string;
  rx: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
};


declare type WorkoutScoreResponse = {
  statusCode: number;
  body: WorkoutScoreData;
};