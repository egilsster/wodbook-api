type MovementData = {
  movement_id: string;
  user_id: string;
  name: string;
  measurement: string;
  global: boolean;
  scores: any[]; // TODO(egilsster): add scores for movements
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
