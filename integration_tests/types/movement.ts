export type MovementData = {
  movement_id: string;
  user_id: string;
  name: string;
  measurement: string;
  is_public: boolean;
  scores: MovementScoreData[];
  created_at: string;
  updated_at: string;
};

export type ManyMovementsData = {
  data: MovementData[];
};

export type MovementScoreData = {
  movement_id: string;
  movement_score_id: string;
  score: number;
  reps: number;
  sets: number;
  notes: string;
  created_at: string;
  updated_at: string;
};
