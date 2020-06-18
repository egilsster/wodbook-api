type LoginData = {
  token: string;
};

declare type LoginResponse = {
  statusCode: number;
  body: LoginData;
};

declare type LoginPayload = {
  email: string;
  password: string;
};

type UserData = {
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

declare type UserResponse = {
  statusCode: number;
  body: UserData;
};
