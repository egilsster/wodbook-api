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
