import * as jwt from "jsonwebtoken";

const cert = "cHVibGljS2V5";
export const userId = "GbCUZ36TQ1ebQmIF4W4JPu6RhP_MXD-7";
export const adminId = "otgdqlk1muHkCxfa7YPwKg_winE8enNR";

export default {
  user: jwt.sign(
    { userId: userId, email: "user@email.com", admin: false },
    cert
  ),
  admin: jwt.sign(
    { userId: adminId, email: "admin@email.com", admin: true },
    cert
  ),
};
