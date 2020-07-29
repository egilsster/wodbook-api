import { MongoClient, Db } from "mongodb";
import { createReadStream } from "fs";
import * as request from "request-promise-native";
import * as HttpStatus from "http-status-codes";
import { createUsers, getMongoClient } from "./common";
import users from "./data/users";

const mywodFilePath = `${process.cwd()}/data.mywod`;
const packageJsonFilePath = `${process.cwd()}/package.json`;

describe("/users/mywod", () => {
  const reqOpts: request.RequestPromiseOptions = {
    json: true,
    resolveWithFullResponse: true, // Get the full response instead of just the body
    simple: false, // Get a rejection only if the request failed for technical reasons
    baseUrl: `${process.env.API_URL || "http://127.0.0.1:43210"}/v1`,
  };

  let mongoClient: MongoClient;
  let db: Db;

  let userToken: string;
  let adminToken: string;

  const login = async ({ email, password }: LoginPayload) => {
    const res1: TokenResponse = await request.post("users/login", {
      ...reqOpts,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        email,
        password,
      },
    });

    expect(res1.statusCode).toBe(HttpStatus.OK);
    expect(res1.body).toHaveProperty("token");
    const { token } = res1.body;

    return token;
  };

  beforeAll(async () => {
    mongoClient = await getMongoClient();
    db = mongoClient.db();

    await createUsers(db);

    userToken = await login({
      email: "user@wodbook.com",
      password: "user",
    });
    adminToken = await login({
      email: "admin@wodbook.com",
      password: "admin",
    });
  });

  beforeEach(async () => {
    await db.collection("workouts").deleteMany({});
    await db.collection("workoutscores").deleteMany({});
    await db.collection("movements").deleteMany({});
    await db.collection("movementscores").deleteMany({});
  });

  afterAll(async () => {
    await mongoClient.close();
  });

  describe("/mywod", () => {
    jest.setTimeout(10000);

    it("should migrate data from a mywod backup to the user", async (done) => {
      try {
        // GET DATA ABOUT USER OWNED STUFF FOR REFERENCE
        const res1: UserResponse = await request.get("users/me", {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        });

        const user = users[1];

        expect(res1.statusCode).toBe(HttpStatus.OK);
        const userBefore = res1.body;
        expect(userBefore.first_name).toEqual(user.first_name);
        expect(userBefore.last_name).toEqual(user.last_name);
        expect(userBefore.box_name).toEqual(user.box_name);
        expect(userBefore.date_of_birth).toEqual(user.date_of_birth);
        expect(userBefore.email).toEqual(user.email);
        expect(userBefore.height).toEqual(user.height);
        expect(userBefore.weight).toEqual(user.weight);
        expect(userBefore.avatar_url).toEqual(user.avatar_url);

        const res2: ManyWorkoutsResponse = await request.get("/workouts", {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        });

        expect(res2.statusCode).toBe(HttpStatus.OK);
        expect(res2.body).toHaveProperty("data");
        const workoutsBefore = res2.body.data;
        expect(workoutsBefore.length).toBeLessThan(20);

        // TODO: Check for workout scores

        const res4: ManyMovementsResponse = await request.get("/movements", {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        });

        expect(res4.statusCode).toBe(HttpStatus.OK);
        expect(res4.body).toHaveProperty("data");
        const movementsBefore = res4.body.data;
        expect(movementsBefore.length).toBeLessThan(5);

        // TODO: Check for movement scores

        // Submit the mywod file for migration
        const res6: MyWodResponse = await request.post("/users/mywod", {
          ...reqOpts,
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          formData: {
            file: createReadStream(mywodFilePath),
          },
        });

        expect(res6.statusCode).toEqual(HttpStatus.OK);
        expect(res6.body.added_workouts).toBeGreaterThan(50);
        expect(res6.body.added_workout_scores).toBeGreaterThan(100);
        expect(res6.body.added_movements).toBeGreaterThan(15);
        expect(res6.body.added_movement_scores).toBeGreaterThan(50);

        // Verify that things got updated
        const res7: UserResponse = await request.get("users/me", {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        });

        expect(res1.statusCode).toBe(HttpStatus.OK);
        const userAfter = res7.body;
        expect(userAfter.first_name).not.toEqual(user.first_name);
        expect(userAfter.last_name).not.toEqual(user.last_name);
        expect(userAfter.box_name).not.toEqual(user.box_name);
        expect(userAfter.date_of_birth).not.toEqual(user.date_of_birth);
        expect(userAfter.email).toEqual(user.email);
        expect(userAfter.height).not.toEqual(user.height);
        expect(userAfter.weight).not.toEqual(user.weight);
        // expect(userAfter.avatar_url).not.toEqual(user.avatar_url);

        const res8: ManyWorkoutsResponse = await request.get("/workouts", {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        });

        expect(res8.statusCode).toBe(HttpStatus.OK);
        expect(res8.body).toHaveProperty("data");
        const workoutsAfter = res8.body.data;
        expect(workoutsAfter.length).toBeGreaterThan(workoutsBefore.length);

        // TODO: Check workout scores

        const res10: ManyMovementsResponse = await request.get("/movements", {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        });

        expect(res10.statusCode).toBe(HttpStatus.OK);
        expect(res10.body).toHaveProperty("data");
        const movementsAfter = res10.body.data;
        expect(movementsAfter.length).toBeGreaterThan(movementsBefore.length);

        // TODO: Check movement scores

        done();
      } catch (err) {
        done(err);
      }
    });

    it("should get a 500 error if file is not valid", async (done) => {
      try {
        // Submit the mywod file for migration
        const res1: MyWodResponse = await request.post("/users/mywod", {
          ...reqOpts,
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          formData: {
            file: createReadStream(packageJsonFilePath),
          },
        });

        expect(res1.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
