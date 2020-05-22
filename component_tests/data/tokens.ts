import * as jwt from "jsonwebtoken";

const cert = "cHVibGljS2V5";
export const userId = "07254ac4-f1ac-43d8-9f7e-2ae12c0a7c74";
export const adminId = "d2e45489-b50c-4a4d-b015-84830b246fae";

export default {
  user: jwt.sign(
    { userId: userId, sub: "user@email.com", admin: false },
    cert
  ),
  admin: jwt.sign(
    { userId: adminId, sub: "admin@email.com", admin: true },
    cert
  ),
};
