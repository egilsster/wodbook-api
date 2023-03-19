import { MovementScoreData } from "./movement";
import { WorkoutScoreData } from "./workout";

export type LoginData = {
  token: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type UserData = {
  user_id: string;
  email: string;
  password: string;
  admin: boolean;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  height: number;
  weight: number;
  box_name: string;
  avatar_url: string;
};

export type UserScores = {
  movement_scores: MovementScoreData[];
  workout_scores: WorkoutScoreData[];
};
