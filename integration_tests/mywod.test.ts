import { MongoClient, Db } from "mongodb";
import { readFile } from "node:fs/promises";
import { StatusCodes } from "http-status-codes";
import { createUsers, getMongoClient } from "./common";
import users from "./data/users";
import { LoginPayload, LoginData, UserData } from "./types/user";
import { ManyWorkoutsData } from "./types/workout";
import { ManyMovementsData } from "./types/movement";
import { MyWodData } from "./types/mywod";

const mywodFilePath = `${process.cwd()}/data.mywod`;
const packageJsonFilePath = `${process.cwd()}/package.json`;

const baseUrl = `${process.env.API_URL || "http://127.0.0.1:43210"}/v1`;

describe(`${baseUrl}/users/mywod`, () => {
  let mongoClient: MongoClient;
  let db: Db;

  let userToken: string;
  // let adminToken: string;

  const login = async ({ email, password }: LoginPayload) => {
    const res = await fetch(`${baseUrl}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const body: LoginData = await res.json();
    expect(res.status).toBe(StatusCodes.OK);
    expect(body).toHaveProperty("token");
    const { token } = body;

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
    // adminToken = await login({
    //   email: "admin@wodbook.com",
    //   password: "admin",
    // });
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

    it("should migrate data from a mywod backup to the user", async () => {
      // GET DATA ABOUT USER OWNED STUFF FOR REFERENCE
      const res1 = await fetch(`${baseUrl}/users/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      const user = users[1];

      expect(res1.status).toBe(StatusCodes.OK);
      const userBefore: UserData = await res1.json();
      expect(userBefore.first_name).toEqual(user.first_name);
      expect(userBefore.last_name).toEqual(user.last_name);
      expect(userBefore.box_name).toEqual(user.box_name);
      expect(userBefore.date_of_birth).toEqual(user.date_of_birth);
      expect(userBefore.email).toEqual(user.email);
      expect(userBefore.height).toEqual(user.height);
      expect(userBefore.weight).toEqual(user.weight);
      expect(userBefore.avatar_url).toEqual(user.avatar_url);

      const res2 = await fetch(`${baseUrl}/workouts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body2: ManyWorkoutsData = await res2.json();

      expect(res2.status).toBe(StatusCodes.OK);
      expect(body2).toHaveProperty("data");
      const workoutsBefore = body2.data;
      expect(workoutsBefore.length).toBeLessThan(20);

      // TODO: Check for workout scores

      const res3 = await fetch(`${baseUrl}/movements`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body3: ManyMovementsData = await res3.json();

      expect(res3.status).toBe(StatusCodes.OK);
      expect(body3).toHaveProperty("data");
      const movementsBefore = body3.data;
      expect(movementsBefore.length).toBeLessThan(5);

      // TODO: Check for movement scores

      // Submit the mywod file for migration
      const formData = new FormData();
      formData.append("file", new Blob([await readFile(mywodFilePath)]));

      const res6 = await fetch(`${baseUrl}/users/mywod`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      });
      const body6: MyWodData = await res6.json();

      expect(res6.status).toEqual(StatusCodes.OK);
      expect(body6.added_workouts).toBeGreaterThan(50);
      expect(body6.added_workout_scores).toBeGreaterThan(100);
      expect(body6.added_movements).toBeGreaterThan(15);
      expect(body6.added_movement_scores).toBeGreaterThan(50);

      // Verify that things got updated
      const res7 = await fetch(`${baseUrl}/users/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      expect(res7.status).toBe(StatusCodes.OK);
      const userAfter: UserData = await res7.json();
      expect(userAfter.first_name).not.toEqual(user.first_name);
      expect(userAfter.last_name).not.toEqual(user.last_name);
      expect(userAfter.box_name).not.toEqual(user.box_name);
      expect(userAfter.date_of_birth).not.toEqual(user.date_of_birth);
      expect(userAfter.email).toEqual(user.email);
      expect(userAfter.height).not.toEqual(user.height);
      expect(userAfter.weight).not.toEqual(user.weight);
      expect(userAfter.avatar_url).not.toEqual(user.avatar_url);

      const res8 = await fetch(`${baseUrl}/workouts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body8: ManyWorkoutsData = await res8.json();

      expect(res8.status).toBe(StatusCodes.OK);
      expect(body8).toHaveProperty("data");
      const workoutsAfter = body8.data;
      expect(workoutsAfter.length).toBeGreaterThan(workoutsBefore.length);

      // TODO: Check workout scores

      const res10 = await fetch(`${baseUrl}/movements`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body10: ManyMovementsData = await res10.json();

      expect(res10.status).toBe(StatusCodes.OK);
      expect(body10).toHaveProperty("data");
      const movementsAfter = body10.data;
      expect(movementsAfter.length).toBeGreaterThan(movementsBefore.length);

      // Find 1000m rowing and 21.1km rowing
      const defaultRow = movementsAfter.find(
        (movement) => movement.name === "Rowing"
      );
      const shortRow = movementsAfter.find(
        (movement) => movement.name === "1000m Rowing"
      );
      const longRow = movementsAfter.find(
        (movement) => movement.name === "21.1km Rowing"
      );

      expect(defaultRow).toBeUndefined();
      expect(shortRow?.measurement).toEqual("time");
      expect(longRow?.measurement).toEqual("time");

      // TODO: Check movement scores
    });

    it("should get a 500 error if file is not valid", async () => {
      const formData = new FormData();
      formData.append("file", new Blob([await readFile(packageJsonFilePath)]));

      // Submit the mywod file for migration
      const res1 = await fetch(`${baseUrl}/users/mywod`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      });

      expect(res1.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });
});
