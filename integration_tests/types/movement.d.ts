type MovementData = {
  movement_id: string;
  user_id: string;
  name: string;
  measurement: string;
  is_public: boolean;
  scores: MovementScoreData[];
  created_at: string;
  updated_at: string;
};

type ManyMovementsData = {
  data: MovementData[];
};

declare type MovementResponse = {
  statusCode: number;
  body: MovementData;
};

declare type ManyMovementsResponse = {
  statusCode: number;
  body: ManyMovementsData;
};

declare type MovementScoreData = {
  movement_id: string;
  movement_score_id: string;
  score: number;
  reps: number;
  sets: number;
  notes: string;
  created_at: string;
  updated_at: string;
};

declare type MovementScoreResponse = {
  statusCode: number;
  body: MovementScoreData;
};
