import { createHash } from "crypto";
import { adminId, userId } from "./tokens";

const hashPassword = (password: string) =>
  createHash("sha256").update(password).digest("hex");

export default [
  {
    user_id: adminId,
    email: "admin@wodbook.com",
    password: hashPassword("admin"),
    admin: true,
    first_name: "Tommy",
    last_name: "Wiseau",
    date_of_birth: "1955-10-03",
    height: 174,
    weight: 85000,
    box_name: "The Room",
    avatar_url: "",
  },
  {
    user_id: userId,
    email: "user@wodbook.com",
    password: hashPassword("user"),
    admin: false,
    first_name: "Greg",
    last_name: "Sestero",
    date_of_birth: "1978-07-15",
    height: 187,
    weight: 89000,
    box_name: "The Room",
    avatar_url: "",
  },
];
