export type WorkoutData = {
  workout_id: string;
  user_id: string;
  name: string;
  description: string;
  measurement: string;
  is_public: boolean;
  scores: WorkoutScoreData[];
  created_at: string;
  updated_at: string;
};

export type ManyWorkoutsData = {
  data: WorkoutData[];
};

export type WorkoutScoreData = {
  workout_id: string;
  workout_score_id: string;
  score: number;
  rx: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
};
