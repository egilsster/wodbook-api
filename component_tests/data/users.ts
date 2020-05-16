import { adminId, userId } from "./tokens";

export default [
  {
    id: adminId,
    email: "admin@email.com",
    password: "pass",
    admin: false,
    firstName: "Tommy",
    lastName: "Wiseau",
    dateOfBirth: new Date("1955-10-03"),
    height: 174,
    weight: 85000,
    boxName: "The Room",
    avatarUrl: "",
  },
  {
    id: userId,
    email: "user@email.com",
    password: "pass",
    admin: false,
    firstName: "Greg",
    lastName: "Sestero",
    dateOfBirth: new Date("1978-07-15"),
    height: 187,
    weight: 89000,
    boxName: "The Room",
    avatarUrl: "",
  },
];
