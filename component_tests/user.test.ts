import { MongoClient } from "mongodb";
import * as request from "request-promise-native";
import * as HttpStatus from "http-status-codes";
import users from "./data/users";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/wodbook-test";

describe("/users", () => {
  const reqOpts: request.RequestPromiseOptions = {
    json: true,
    resolveWithFullResponse: true, // Get the full response instead of just the body
    simple: false, // Get a rejection only if the request failed for technical reasons
    baseUrl: `${process.env.API_URL || "http://127.0.0.1:43210"}/v1`,
  };

  let mongoClient: MongoClient;

  beforeAll(async () => {
    mongoClient = await MongoClient.connect(MONGO_URI, {
      useUnifiedTopology: true,
    });
    const db = mongoClient.db();
    const coll = db.collection("users");
    await coll.deleteMany({});
    await coll.insertMany(users);
  });

  afterAll(async () => {
    await mongoClient.close();
  });

  describe("/register and /login", () => {
    describe("POST", () => {
      it("should create new user and login", async (done) => {
        try {
          const res1 = await request.post("users/register", {
            ...reqOpts,
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              first_name: "Juliette",
              last_name: "Danielle",
              box_name: "The Room",
              email: "lisa@the-room.com",
              height: 168,
              weight: 61000,
              date_of_birth: "1980-12-08",
              password: "tearing-me-apart-lisa",
            },
          });

          expect(res1.statusCode).toBe(HttpStatus.CREATED);
          expect(res1.body).toHaveProperty("user_id");
          expect(res1.body).toHaveProperty("first_name", "Juliette");
          expect(res1.body).toHaveProperty("last_name", "Danielle");
          expect(res1.body).toHaveProperty("box_name", "The Room");
          expect(res1.body).toHaveProperty("email", "lisa@the-room.com");
          expect(res1.body).toHaveProperty("height", 168);
          expect(res1.body).toHaveProperty("weight", 61000);
          expect(res1.body).toHaveProperty("date_of_birth", "1980-12-08");
          expect(res1.body).not.toHaveProperty("password");

          const res2 = await request.post("users/login", {
            ...reqOpts,
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              email: "lisa@the-room.com",
              password: "tearing-me-apart-lisa",
            },
          });

          expect(res2.statusCode).toBe(HttpStatus.OK);
          expect(res2.body).toHaveProperty("token");
          expect(res2.body.token.startsWith("ey")).toBe(true);
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  describe("/me", () => {
    describe("GET", () => {
      it("should get information for the logged in user (non admin)", async (done) => {
        try {
          const res1 = await request.post("users/login", {
            ...reqOpts,
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              email: "user@wodbook.com",
              password: "user",
            },
          });

          expect(res1.statusCode).toBe(HttpStatus.OK);
          expect(res1.body).toHaveProperty("token");
          const { token } = res1.body;

          const res2 = await request.get("users/me", {
            ...reqOpts,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          expect(res2.statusCode).toBe(HttpStatus.OK);
          expect(res2.body).toHaveProperty("user_id");
          expect(res2.body).toHaveProperty("first_name", "Greg");
          expect(res2.body).toHaveProperty("last_name", "Sestero");
          expect(res2.body).toHaveProperty("box_name", "The Room");
          expect(res2.body).toHaveProperty("email", "user@wodbook.com");
          expect(res2.body).toHaveProperty("height", 187);
          expect(res2.body).toHaveProperty("weight", 89000);
          expect(res2.body).toHaveProperty("date_of_birth");
          expect(res2.body).toHaveProperty("password");
          done();
        } catch (err) {
          done(err);
        }
      });

      it("should get information for the logged in user (admin)", async (done) => {
        try {
          const res1 = await request.post("users/login", {
            ...reqOpts,
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              email: "admin@wodbook.com",
              password: "admin",
            },
          });

          expect(res1.statusCode).toBe(HttpStatus.OK);
          expect(res1.body).toHaveProperty("token");
          const { token } = res1.body;

          const res2 = await request.get("users/me", {
            ...reqOpts,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          expect(res2.statusCode).toBe(HttpStatus.OK);
          expect(res2.body).toHaveProperty("user_id");
          expect(res2.body).toHaveProperty("first_name", "Tommy");
          expect(res2.body).toHaveProperty("last_name", "Wiseau");
          expect(res2.body).toHaveProperty("box_name", "The Room");
          expect(res2.body).toHaveProperty("email", "admin@wodbook.com");
          expect(res2.body).toHaveProperty("height", 174);
          expect(res2.body).toHaveProperty("weight", 85000);
          expect(res2.body).toHaveProperty("date_of_birth");
          expect(res2.body).toHaveProperty("password");
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });
});
