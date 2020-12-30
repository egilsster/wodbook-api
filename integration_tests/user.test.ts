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
  });

  afterEach(async () => {
    const db = mongoClient.db();
    const user_coll = db.collection("users");
    await user_coll.deleteMany({});
    await user_coll.insertMany(users);

    db.collection("movements").deleteMany({});
    db.collection("movementscores").deleteMany({});
    db.collection("workouts").deleteMany({});
    db.collection("workoutscores").deleteMany({});
  });

  afterAll(async () => {
    await mongoClient.close();
  });

  describe("/register and /login", () => {
    describe("POST", () => {
      it("should create new user and login", async (done) => {
        try {
          const res1: TokenResponse = await request.post("users/register", {
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
          expect(res1.body).toHaveProperty("token");

          const res2: TokenResponse = await request.post("users/login", {
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

          const token = res2.body.token;

          const res3: UserResponse = await request.get("users/me", {
            ...reqOpts,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          expect(res3.statusCode).toBe(HttpStatus.OK);
          expect(res3.body).toHaveProperty("user_id");
          expect(res3.body).toHaveProperty("first_name", "Juliette");
          expect(res3.body).toHaveProperty("last_name", "Danielle");
          expect(res3.body).toHaveProperty("box_name", "The Room");
          expect(res3.body).toHaveProperty("email", "lisa@the-room.com");
          expect(res3.body).toHaveProperty("height", 168);
          expect(res3.body).toHaveProperty("weight", 61000);
          expect(res3.body).toHaveProperty("date_of_birth", "1980-12-08");
          expect(res3.body).toHaveProperty("password");
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

    describe("PATCH", () => {
      it("should update user information", async (done) => {
        try {
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

          const res1 = await request.post("users/register", {
            ...reqOpts,
            headers: {
              "Content-Type": "application/json",
            },
            body: user,
          });

          expect(res1.statusCode).toBe(HttpStatus.CREATED);
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
          expect(res2.body).toHaveProperty("first_name", user.first_name);
          expect(res2.body).toHaveProperty("last_name", user.last_name);
          expect(res2.body).toHaveProperty("box_name", user.box_name);
          expect(res2.body).toHaveProperty("email", user.email);
          expect(res2.body).toHaveProperty("height", user.height);
          expect(res2.body).toHaveProperty("weight", user.weight);
          expect(res2.body).toHaveProperty("date_of_birth", user.date_of_birth);
          expect(res2.body).toHaveProperty("password");

          const res3 = await request.patch("users/me", {
            ...reqOpts,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: {
              first_name: "new first_name",
              last_name: "new last_name",
              box_name: "new box_name",
            },
          });

          expect(res3.statusCode).toBe(HttpStatus.OK);
          // Verify new data
          expect(res3.body).toHaveProperty("first_name", "new first_name");
          expect(res3.body).toHaveProperty("last_name", "new last_name");
          expect(res3.body).toHaveProperty("box_name", "new box_name");
          // Verify that unchanged data remains there
          expect(res3.body).toHaveProperty("email", user.email);
          expect(res3.body).toHaveProperty("height", user.height);
          expect(res3.body).toHaveProperty("weight", user.weight);
          expect(res3.body).toHaveProperty("date_of_birth", user.date_of_birth);
          expect(res3.body).toHaveProperty("password");

          // Verify that the GET requests returns the same data
          const res4 = await request.get("users/me", {
            ...reqOpts,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          expect(res4.statusCode).toBe(HttpStatus.OK);
          expect(res4.body).toHaveProperty("user_id");
          expect(res4.body).toHaveProperty("first_name", "new first_name");
          expect(res4.body).toHaveProperty("last_name", "new last_name");
          expect(res4.body).toHaveProperty("box_name", "new box_name");
          expect(res4.body).toHaveProperty("email", user.email);
          expect(res4.body).toHaveProperty("height", user.height);
          expect(res4.body).toHaveProperty("weight", user.weight);
          expect(res4.body).toHaveProperty("date_of_birth", user.date_of_birth);
          expect(res4.body).toHaveProperty("password");

          done();
        } catch (err) {
          done(err);
        }
      });

      it("should change password", async (done) => {
        try {
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

          const res1 = await request.post("users/register", {
            ...reqOpts,
            headers: {
              "Content-Type": "application/json",
            },
            body: user,
          });

          expect(res1.statusCode).toBe(HttpStatus.CREATED);
          const { token } = res1.body;

          const new_pass = "my-new-password";

          const res2 = await request.patch("users/me", {
            ...reqOpts,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: {
              password: new_pass,
            },
          });

          expect(res2.statusCode).toBe(HttpStatus.OK);

          // Verify that login works with the new password
          const res3 = await request.post("users/login", {
            ...reqOpts,
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              email: user.email,
              password: new_pass,
            },
          });

          expect(res3.statusCode).toBe(HttpStatus.OK);
          expect(res3.body).toHaveProperty("token");

          // Verify that login does NOT work with the old password
          const res4 = await request.post("users/login", {
            ...reqOpts,
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              email: user.email,
              password: user.password,
            },
          });

          expect(res4.statusCode).toBe(HttpStatus.BAD_REQUEST);

          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  describe("/me/scores", () => {
    it("should return all scores for the user", async (done) => {
      const movement = {
        name: "Deadlift",
        measurement: "weight",
      };
      const wod = {
        name: "Heavy Fran",
        measurement: "time",
        description: "15-12-9 Thruster (60kg / 45kg) / Chest to bar (weighted)",
      };

      try {
        const login_res = await request.post("users/login", {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            email: "user@wodbook.com",
            password: "user",
          },
        });

        expect(login_res.statusCode).toBe(HttpStatus.OK);
        expect(login_res.body).toHaveProperty("token");
        const { token } = login_res.body;

        const score_res1: UserScoreResponse = await request.get(
          "users/me/scores",
          {
            ...reqOpts,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        expect(score_res1.statusCode).toBe(HttpStatus.OK);
        expect(score_res1.body).toHaveProperty("movement_scores");
        expect(score_res1.body).toHaveProperty("workout_scores");
        expect(score_res1.body.movement_scores.length).toEqual(0);
        expect(score_res1.body.workout_scores.length).toEqual(0);

        // Create movement & score
        const movement_res1: MovementResponse = await request.post(
          "/movements",
          {
            ...reqOpts,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: {
              name: movement.name,
              measurement: movement.measurement,
            },
          }
        );

        expect(movement_res1.statusCode).toBe(HttpStatus.CREATED);
        const movementId = movement_res1.body.movement_id;

        const new_movement_score_res: MovementResponse = await request.post(
          `/movements/${movementId}`,
          {
            ...reqOpts,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: {
              score: 200,
              measurement: "weight",
            },
          }
        );

        expect(new_movement_score_res.statusCode).toBe(HttpStatus.CREATED);

        // Create workout & score
        const workout_res1: WorkoutResponse = await request.post("/workouts", {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: wod,
        });

        expect(workout_res1.statusCode).toBe(HttpStatus.CREATED);
        const workoutId = workout_res1.body.workout_id;

        const new_workout_score_res1: WorkoutResponse = await request.post(
          `/workouts/${workoutId}`,
          {
            ...reqOpts,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: {
              score: 260,
              rx: true,
            },
          }
        );

        expect(new_workout_score_res1.statusCode).toBe(HttpStatus.CREATED);

        const new_workout_score_res2: WorkoutResponse = await request.post(
          `/workouts/${workoutId}`,
          {
            ...reqOpts,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: {
              score: 260,
              rx: true,
            },
          }
        );

        expect(new_workout_score_res2.statusCode).toBe(HttpStatus.CREATED);

        const score_res2: UserScoreResponse = await request.get(
          "users/me/scores",
          {
            ...reqOpts,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        expect(score_res2.statusCode).toBe(HttpStatus.OK);
        expect(score_res2.body).toHaveProperty("movement_scores");
        expect(score_res2.body).toHaveProperty("workout_scores");
        expect(score_res2.body.movement_scores.length).toEqual(1);
        expect(score_res2.body.workout_scores.length).toEqual(2);

        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
