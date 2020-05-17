import { createHash } from "crypto";
import { adminId, userId } from "./tokens";

const hashPassword = (password: string) =>
  createHash("sha256").update(password).digest("hex");

export default [
  {
    user_id: adminId,
    email: "admin@email.com",
    password: hashPassword("password"),
    admin: true,
    first_name: "Tommy",
    last_name: "Wiseau",
    date_of_birth: new Date("1955-10-03").toISOString(),
    height: 174,
    weight: 85000,
    box_name: "The Room",
    avatar_url: "",
  },
  {
    user_id: userId,
    email: "user@email.com",
    password: hashPassword("password"),
    admin: false,
    first_name: "Greg",
    last_name: "Sestero",
    date_of_birth: new Date("1978-07-15").toISOString(),
    height: 187,
    weight: 89000,
    box_name: "The Room",
    avatar_url: "",
  },
];
