import { MongoClient } from "mongodb";
import { StatusCodes } from "http-status-codes";
import users from "./data/users";
import { LoginData, UserData, UserScores } from "./types/user";
import { MovementData } from "./types/movement";
import { WorkoutData } from "./types/workout";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/wodbook-test";

const baseUrl = `${process.env.API_URL || "http://127.0.0.1:43210"}/v1`;

describe("/users", () => {
  let mongoClient: MongoClient;

  beforeAll(async () => {
    mongoClient = await MongoClient.connect(MONGO_URI);
  });

  afterEach(async () => {
    const db = mongoClient.db();
    const user_coll = db.collection("users");
    await user_coll.deleteMany({});
    await user_coll.insertMany(users);

    await db.collection("movements").deleteMany({});
    await db.collection("movementscores").deleteMany({});
    await db.collection("workouts").deleteMany({});
    await db.collection("workoutscores").deleteMany({});
  });

  afterAll(async () => {
    await mongoClient.close();
  });

  describe("/register and /login", () => {
    describe("POST", () => {
      it("should create new user and login", async () => {
        const res1 = await fetch(`${baseUrl}/users/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: "Juliette",
            last_name: "Danielle",
            box_name: "The Room",
            email: "lisa@the-room.com",
            height: 168,
            weight: 61000,
            date_of_birth: "1980-12-08",
            password: "tearing-me-apart-lisa",
          }),
        });

        const body1: LoginData = await res1.json();
        expect(res1.status).toBe(StatusCodes.CREATED);
        expect(body1).toHaveProperty("token");

        const res2 = await fetch(`${baseUrl}/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "lisa@the-room.com",
            password: "tearing-me-apart-lisa",
          }),
        });

        const body2: LoginData = await res2.json();
        expect(res2.status).toBe(StatusCodes.OK);
        expect(body2).toHaveProperty("token");
        expect(body2.token.startsWith("ey")).toBe(true);

        const token = body2.token;

        const res3 = await fetch(`${baseUrl}/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const body3: UserData = await res3.json();

        expect(res3.status).toBe(StatusCodes.OK);
        expect(body3).toHaveProperty("user_id");
        expect(body3).toHaveProperty("first_name", "Juliette");
        expect(body3).toHaveProperty("last_name", "Danielle");
        expect(body3).toHaveProperty("box_name", "The Room");
        expect(body3).toHaveProperty("email", "lisa@the-room.com");
        expect(body3).toHaveProperty("height", 168);
        expect(body3).toHaveProperty("weight", 61000);
        expect(body3).toHaveProperty("date_of_birth", "1980-12-08");
        expect(body3).toHaveProperty("password");
      });
    });
  });

  describe("/me", () => {
    describe("GET", () => {
      it("should get information for the logged in user (non admin)", async () => {
        const res1 = await fetch(`${baseUrl}/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "user@wodbook.com",
            password: "user",
          }),
        });

        const body1: LoginData = await res1.json();
        expect(res1.status).toBe(StatusCodes.OK);
        expect(body1).toHaveProperty("token");
        const { token } = body1;

        const res2 = await fetch(`${baseUrl}/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const body2: UserData = await res2.json();

        expect(res2.status).toBe(StatusCodes.OK);
        expect(body2).toHaveProperty("user_id");
        expect(body2).toHaveProperty("first_name", "Greg");
        expect(body2).toHaveProperty("last_name", "Sestero");
        expect(body2).toHaveProperty("box_name", "The Room");
        expect(body2).toHaveProperty("email", "user@wodbook.com");
        expect(body2).toHaveProperty("height", 187);
        expect(body2).toHaveProperty("weight", 89000);
        expect(body2).toHaveProperty("date_of_birth");
        expect(body2).toHaveProperty("password");
      });

      it("should get information for the logged in user (admin)", async () => {
        const res1 = await fetch(`${baseUrl}/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "admin@wodbook.com",
            password: "admin",
          }),
        });
        const body1: LoginData = await res1.json();

        expect(res1.status).toBe(StatusCodes.OK);
        expect(body1).toHaveProperty("token");
        const { token } = body1;

        const res2 = await fetch(`${baseUrl}/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const body2: UserData = await res2.json();

        expect(res2.status).toBe(StatusCodes.OK);
        expect(body2).toHaveProperty("user_id");
        expect(body2).toHaveProperty("first_name", "Tommy");
        expect(body2).toHaveProperty("last_name", "Wiseau");
        expect(body2).toHaveProperty("box_name", "The Room");
        expect(body2).toHaveProperty("email", "admin@wodbook.com");
        expect(body2).toHaveProperty("height", 174);
        expect(body2).toHaveProperty("weight", 85000);
        expect(body2).toHaveProperty("date_of_birth");
        expect(body2).toHaveProperty("password");
      });
    });

    describe("PATCH", () => {
      it("should update user information", async () => {
        const user = {
          first_name: "Hansel",
          last_name: "Dude",
          box_name: "Zoolander",
          email: "hansel@zoolander.com",
          height: 183,
          weight: 82000,
          date_of_birth: "1985-05-01",
          password: "so-hot-right-now",
        };

        const res1 = await fetch(`${baseUrl}/users/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        });

        const body1: LoginData = await res1.json();
        expect(res1.status).toBe(StatusCodes.CREATED);
        const { token } = body1;

        const res2 = await fetch(`${baseUrl}/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const body2: UserData = await res2.json();

        expect(res2.status).toBe(StatusCodes.OK);
        expect(body2).toHaveProperty("user_id");
        expect(body2).toHaveProperty("first_name", user.first_name);
        expect(body2).toHaveProperty("last_name", user.last_name);
        expect(body2).toHaveProperty("box_name", user.box_name);
        expect(body2).toHaveProperty("email", user.email);
        expect(body2).toHaveProperty("height", user.height);
        expect(body2).toHaveProperty("weight", user.weight);
        expect(body2).toHaveProperty("date_of_birth", user.date_of_birth);
        expect(body2).toHaveProperty("password");

        const res3 = await fetch(`${baseUrl}/users/me`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            first_name: "new first_name",
            last_name: "new last_name",
            box_name: "new box_name",
          }),
        });
        const body3: UserData = await res3.json();

        expect(res3.status).toBe(StatusCodes.OK);
        // Verify new data
        expect(body3).toHaveProperty("first_name", "new first_name");
        expect(body3).toHaveProperty("last_name", "new last_name");
        expect(body3).toHaveProperty("box_name", "new box_name");
        // Verify that unchanged data remains there
        expect(body3).toHaveProperty("email", user.email);
        expect(body3).toHaveProperty("height", user.height);
        expect(body3).toHaveProperty("weight", user.weight);
        expect(body3).toHaveProperty("date_of_birth", user.date_of_birth);
        expect(body3).toHaveProperty("password");

        // Verify that the GET requests returns the same data
        const res4 = await fetch(`${baseUrl}/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const body4: UserData = await res4.json();
        expect(res4.status).toBe(StatusCodes.OK);
        expect(body4).toHaveProperty("user_id");
        expect(body4).toHaveProperty("first_name", "new first_name");
        expect(body4).toHaveProperty("last_name", "new last_name");
        expect(body4).toHaveProperty("box_name", "new box_name");
        expect(body4).toHaveProperty("email", user.email);
        expect(body4).toHaveProperty("height", user.height);
        expect(body4).toHaveProperty("weight", user.weight);
        expect(body4).toHaveProperty("date_of_birth", user.date_of_birth);
        expect(body4).toHaveProperty("password");
      });

      it("should change password", async () => {
        const user = {
          first_name: "Hansel",
          last_name: "Dude",
          box_name: "Zoolander",
          email: "hansel@zoolander.com",
          height: 183,
          weight: 82000,
          date_of_birth: "1985-05-01",
          password: "so-hot-right-now",
        };

        const res1 = await fetch(`${baseUrl}/users/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        });

        const body1: LoginData = await res1.json();
        expect(res1.status).toBe(StatusCodes.CREATED);
        const { token } = body1;

        const new_pass = "my-new-password";

        const res2 = await fetch(`${baseUrl}/users/me`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            password: new_pass,
          }),
        });

        expect(res2.status).toBe(StatusCodes.OK);

        // Verify that login works with the new password
        const res3 = await fetch(`${baseUrl}/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            password: new_pass,
          }),
        });

        const body3: LoginData = await res3.json();
        expect(res3.status).toBe(StatusCodes.OK);
        expect(body3).toHaveProperty("token");

        // Verify that login does NOT work with the old password
        const res4 = await fetch(`${baseUrl}/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            password: user.password,
          }),
        });

        expect(res4.status).toBe(StatusCodes.BAD_REQUEST);
      });
    });
  });

  describe("/me/scores", () => {
    it("should return all scores for the user", async () => {
      const movement = {
        name: "Deadlift",
        measurement: "weight",
      };
      const wod = {
        name: "Heavy Fran",
        measurement: "time",
        description: "15-12-9 Thruster (60kg / 45kg) / Chest to bar (weighted)",
      };

      const login_res = await fetch(`${baseUrl}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "user@wodbook.com",
          password: "user",
        }),
      });

      const login_body: LoginData = await login_res.json();
      expect(login_res.status).toBe(StatusCodes.OK);
      expect(login_body).toHaveProperty("token");
      const { token } = login_body;

      const score_res1 = await fetch(`${baseUrl}/users/me/scores`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const score_body1: UserScores = await score_res1.json();
      expect(score_res1.status).toBe(StatusCodes.OK);
      expect(score_body1).toHaveProperty("movement_scores");
      expect(score_body1).toHaveProperty("workout_scores");
      expect(score_body1.movement_scores.length).toEqual(0);
      expect(score_body1.workout_scores.length).toEqual(0);

      // Create movement & score
      const movement_res1 = await fetch(`${baseUrl}/movements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(movement),
      });

      const movement_body1: MovementData = await movement_res1.json();
      expect(movement_res1.status).toBe(StatusCodes.CREATED);
      const movementId = movement_body1.movement_id;

      const new_movement_score_res = await fetch(
        `${baseUrl}/movements/${movementId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            score: 200,
            measurement: "weight",
          }),
        }
      );

      expect(new_movement_score_res.status).toBe(StatusCodes.CREATED);

      // Create workout & score
      const workout_res1 = await fetch(`${baseUrl}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(wod),
      });

      const workout_body1: WorkoutData = await workout_res1.json();
      expect(workout_res1.status).toBe(StatusCodes.CREATED);
      const workoutId = workout_body1.workout_id;

      const new_workout_score_res1 = await fetch(
        `${baseUrl}/workouts/${workoutId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            score: 260,
            rx: true,
          }),
        }
      );

      expect(new_workout_score_res1.status).toBe(StatusCodes.CREATED);

      const new_workout_score_res2 = await fetch(
        `${baseUrl}/workouts/${workoutId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            score: 260,
            rx: true,
          }),
        }
      );

      expect(new_workout_score_res2.status).toBe(StatusCodes.CREATED);

      const score_res2 = await fetch(`${baseUrl}/users/me/scores`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const score_body2: UserScores = await score_res2.json();
      expect(score_res2.status).toBe(StatusCodes.OK);
      expect(score_body2).toHaveProperty("movement_scores");
      expect(score_body2).toHaveProperty("workout_scores");
      expect(score_body2.movement_scores.length).toEqual(1);
      expect(score_body2.workout_scores.length).toEqual(2);
    });
  });
});
