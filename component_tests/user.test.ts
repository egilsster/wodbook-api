import { MongoClient, Db } from "mongodb";
import * as request from "request-promise-native";
import tokens from "./data/tokens";
import users from "./data/users";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/wodbook-test";

describe("User component tests", () => {
  const reqOpts: request.RequestPromiseOptions = {
    json: true,
    resolveWithFullResponse: true, // Get the full response instead of just the body
    simple: false, // Get a rejection only if the request failed for technical reasons
    baseUrl: `${process.env.API_URL || "http://127.0.0.1:43210"}/v1`,
  };

  let mongoClient: MongoClient;
  let db: Db;

  beforeAll(async () => {
    mongoClient = await MongoClient.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = mongoClient.db();
    await db.collection("users").deleteMany({});
    await db.collection("users").insertMany(users);
  });

  afterAll(async () => {
    await mongoClient.close();
  });

  describe("user profile", () => {
    it("should get information for the logged in user (non admin)", async (done) => {
      try {
        const res1 = await request.get(`users/me`, {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens.user}`,
          },
        });

        expect(res1.statusCode).toBe(200);
        expect(res1.body).toHaveProperty("firstName", "Greg");
        expect(res1.body).toHaveProperty("lastName", "Sestero");
        expect(res1.body).toHaveProperty("boxName", "The Room");
        expect(res1.body).toHaveProperty("email", "user@email.com");
        expect(res1.body).toHaveProperty("height", 187);
        expect(res1.body).toHaveProperty("weight", 89000);
        expect(res1.body).toHaveProperty("dateOfBirth");
        expect(res1.body).not.toHaveProperty("password");
        done();
      } catch (err) {
        done(err);
      }
    });

    it("should include id of user if logged in user is admin (admin)", async (done) => {
      try {
        const res1 = await request.get(`users/me`, {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens.admin}`,
          },
        });

        expect(res1.statusCode).toBe(200);
        expect(res1.body).toHaveProperty("id");
        expect(res1.body).toHaveProperty("firstName", "Tommy");
        expect(res1.body).toHaveProperty("lastName", "Wiseau");
        expect(res1.body).toHaveProperty("boxName", "The Room");
        expect(res1.body).toHaveProperty("email", "admin@email.com");
        expect(res1.body).toHaveProperty("height", 174);
        expect(res1.body).toHaveProperty("weight", 85000);
        expect(res1.body).toHaveProperty("dateOfBirth");
        expect(res1.body).not.toHaveProperty("password");
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
