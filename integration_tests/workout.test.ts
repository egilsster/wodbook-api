import { MongoClient, Db } from "mongodb";
import * as request from "request-promise-native";
import { StatusCodes } from "http-status-codes";
import { createUsers, getMongoClient } from "./common";

describe("/v1/workouts", () => {
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

    expect(res1.statusCode).toBe(StatusCodes.OK);
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
  });

  afterAll(async () => {
    await mongoClient.close();
  });

  describe("listing workouts", () => {
    it("should return 200 OK with a list", async () => {
      const res1: ManyWorkoutsResponse = await request.get("/workouts", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      expect(res1.statusCode).toBe(StatusCodes.OK);
      expect(res1.body).toHaveProperty("data");
      const workouts = res1.body.data;
      expect(workouts).toHaveProperty("length", 0);
    });
  });

  describe("creating workouts", () => {
    it("should get 201 Created when creating a new workout", async () => {
      const wod = {
        name: "Fran",
        measurement: "time",
        description: "21-15-9 Thruster (42.5kg / 30kg) / Pull ups",
      };

      const placeholder_wod = {
        name: "A placeholder",
        measurement: "time",
        description: "Do some work",
        is_public: true,
      };
      const res0: WorkoutResponse = await request.post("/workouts", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: placeholder_wod,
      });

      expect(res0.statusCode).toBe(StatusCodes.CREATED);

      const res1: WorkoutResponse = await request.post("/workouts", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: wod,
      });

      expect(res1.statusCode).toBe(StatusCodes.CREATED);
      expect(res1.body).toHaveProperty("workout_id");
      const workoutId = res1.body.workout_id;
      expect(res1.body).toHaveProperty("name", wod.name);
      expect(res1.body).toHaveProperty("description", wod.description);
      expect(res1.body).toHaveProperty("measurement", wod.measurement);
      expect(res1.body).toHaveProperty("is_public", false);
      expect(res1.body).toHaveProperty("created_at");
      expect(res1.body).toHaveProperty("updated_at");

      const res2: WorkoutResponse = await request.get(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res2.statusCode).toBe(StatusCodes.OK);
      expect(res2.body).toHaveProperty("workout_id");
      expect(res2.body).toHaveProperty("name", wod.name);
      expect(res2.body).toHaveProperty("description", wod.description);
      expect(res2.body).toHaveProperty("measurement", wod.measurement);
      expect(res2.body).toHaveProperty("is_public", false);
      expect(res2.body).toHaveProperty("created_at");
      expect(res2.body).toHaveProperty("updated_at");

      const res3: ManyWorkoutsResponse = await request.get("/workouts", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      expect(res3.statusCode).toBe(StatusCodes.OK);
      expect(res3.body).toHaveProperty("data");
      const workouts = res3.body.data;
      expect(workouts).toHaveProperty("length", 2);
      const [workout1, workout2] = workouts;
      expect(workout1).toHaveProperty("name", placeholder_wod.name);
      expect(workout1).toHaveProperty("is_public", true);
      expect(workout2).toHaveProperty("workout_id");
      expect(workout2).toHaveProperty("name", wod.name);
      expect(workout2).toHaveProperty("description", wod.description);
      expect(workout2).toHaveProperty("measurement", wod.measurement);
      expect(workout2).toHaveProperty("is_public", false);
      expect(workout2).toHaveProperty("created_at");
      expect(workout2).toHaveProperty("updated_at");
    });

    it("should get 409 Conflict if creating the same workout more than once", async () => {
      const workout = {
        name: "Cindy",
        measurement: "repetitions",
        description: "AMRAP20: 5 pull ups, 10 push ups, 15 air squats",
      };

      const payload = {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: workout,
      };

      const res1: WorkoutResponse = await request.post("/workouts", payload);

      expect(res1.statusCode).toBe(StatusCodes.CREATED);
      expect(res1.body).toHaveProperty("workout_id");
      expect(res1.body).toHaveProperty("name", workout.name);
      expect(res1.body).toHaveProperty("description", workout.description);
      expect(res1.body).toHaveProperty("measurement", workout.measurement);
      expect(res1.body).toHaveProperty("is_public", false);
      expect(res1.body).toHaveProperty("created_at");
      expect(res1.body).toHaveProperty("updated_at");

      const res2: WorkoutResponse = await request.post("/workouts", payload);

      expect(res2.statusCode).toBe(StatusCodes.CONFLICT);
    });

    it("should get 422 Unprocessable Entity if using an invalid measurement", async () => {
      const res: WorkoutResponse = await request.post("/workouts", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          name: "My workout",
          measurement: "invalid-measurement",
          description: "workout description",
        },
      });

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });
  });

  describe("updating workouts", () => {
    it("should be able to workout name and description", async () => {
      const wrongDesc = "21-15-9 Truster (42.5kg / 30kg) / Push ups";
      const correctDesc = "21-15-9 Thruster (42.5kg / 30kg) / Pull ups";
      const wod = {
        name: "Fran",
        measurement: "time",
        description: wrongDesc,
      };

      const res1: WorkoutResponse = await request.post("/workouts", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: wod,
      });

      expect(res1.statusCode).toBe(StatusCodes.CREATED);
      expect(res1.body).toHaveProperty("workout_id");
      const workoutId = res1.body.workout_id;
      expect(res1.body).toHaveProperty("name", wod.name);
      expect(res1.body).toHaveProperty("description", wod.description);
      expect(res1.body).toHaveProperty("measurement", wod.measurement);
      expect(res1.body).toHaveProperty("is_public", false);
      expect(res1.body).toHaveProperty("created_at");
      expect(res1.body).toHaveProperty("updated_at");

      const res2: WorkoutResponse = await request.get(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res2.statusCode).toBe(StatusCodes.OK);
      expect(res2.body).toHaveProperty("workout_id");
      expect(res2.body).toHaveProperty("name", wod.name);
      expect(res2.body).toHaveProperty("description", wrongDesc);
      expect(res2.body).toHaveProperty("measurement", wod.measurement);
      expect(res2.body).toHaveProperty("is_public", false);
      expect(res2.body).toHaveProperty("created_at");
      expect(res2.body).toHaveProperty("updated_at");
      expect(res2.body.created_at).toEqual(res2.body.updated_at);

      const res3: WorkoutResponse = await request.patch(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: {
            name: "Fran!",
            description: correctDesc,
          },
        }
      );

      expect(res3.statusCode).toBe(StatusCodes.OK);
      expect(res3.body).toHaveProperty("workout_id");
      expect(res3.body).toHaveProperty("name", "Fran!");
      expect(res3.body).toHaveProperty("description", correctDesc);
      expect(res3.body).toHaveProperty("measurement", wod.measurement);
      expect(res3.body).toHaveProperty("is_public", false);
      expect(res3.body).toHaveProperty("created_at");
      expect(res3.body).toHaveProperty("updated_at");
      expect(res3.body.created_at).not.toEqual(res3.body.updated_at);

      const res4: WorkoutResponse = await request.get(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res4.statusCode).toBe(StatusCodes.OK);
      expect(res4.body).toHaveProperty("workout_id");
      expect(res4.body).toHaveProperty("name", "Fran!");
      expect(res4.body).toHaveProperty("description", correctDesc);
      expect(res4.body).toHaveProperty("measurement", wod.measurement);
      expect(res4.body).toHaveProperty("is_public", false);
      expect(res4.body).toHaveProperty("created_at");
      expect(res4.body).toHaveProperty("updated_at");
      expect(res4.body.created_at).not.toEqual(res4.body.updated_at);
    });

    it("should get 409 Conflict if you set to a name that already exists", async () => {
      const wod = {
        name: "Fran",
        measurement: "time",
        description: "21-15-9 Thruster (42.5kg / 30kg) / Pull ups",
      };

      const res1: WorkoutResponse = await request.post("/workouts", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: wod,
      });

      expect(res1.statusCode).toBe(StatusCodes.CREATED);
      expect(res1.body).toHaveProperty("workout_id");
      const workoutId = res1.body.workout_id;
      expect(res1.body).toHaveProperty("name", wod.name);
      expect(res1.body).toHaveProperty("description", wod.description);
      expect(res1.body).toHaveProperty("measurement", wod.measurement);

      const res2: WorkoutResponse = await request.post("/workouts", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          ...wod,
          name: "Fran!",
        },
      });

      expect(res2.statusCode).toBe(StatusCodes.CREATED);
      expect(res2.body).toHaveProperty("name", "Fran!");

      const res3: WorkoutResponse = await request.patch(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: {
            name: "Fran",
          },
        }
      );

      expect(res3.statusCode).toBe(StatusCodes.CONFLICT);

      const res4: WorkoutResponse = await request.get(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res4.statusCode).toBe(StatusCodes.OK);
      expect(res4.body).toHaveProperty("name", "Fran");
    });
  });

  describe("deleting workouts", () => {
    it("should delete a workout and its scores", async () => {
      const wod = {
        name: "Fran",
        measurement: "time",
        description: "21-15-9 Thruster (42.5kg / 30kg) / Pull ups",
      };

      const res1: WorkoutResponse = await request.post("/workouts", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: wod,
      });

      expect(res1.statusCode).toBe(StatusCodes.CREATED);
      expect(res1.body).toHaveProperty("workout_id");
      const workoutId = res1.body.workout_id;

      const res2: WorkoutScoreResponse = await request.post(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: {
            score: 260,
            rx: true,
          },
        }
      );

      expect(res2.statusCode).toBe(StatusCodes.CREATED);
      const workoutScoreId = res2.body.workout_score_id;

      const res3: WorkoutResponse = await request.get(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res3.statusCode).toBe(StatusCodes.OK);

      const res4: DeleteResponse = await request.delete(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res4.statusCode).toBe(StatusCodes.NO_CONTENT);

      const res5: WorkoutResponse = await request.get(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res5.statusCode).toBe(StatusCodes.NOT_FOUND);

      const res6: WorkoutScoreResponse = await request.get(
        `/workouts/${workoutId}/${workoutScoreId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res6.statusCode).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe("workout scores", () => {
    it("should create a new workout and add scores to it", async () => {
      const wod = {
        name: "Heavy Fran",
        measurement: "time",
        description: "15-12-9 Thruster (60kg / 45kg) / Chest to bar (weighted)",
      };

      const res1: WorkoutResponse = await request.post("/workouts", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: wod,
      });

      expect(res1.statusCode).toBe(StatusCodes.CREATED);
      expect(res1.body).toHaveProperty("workout_id");
      const workoutId = res1.body.workout_id;
      expect(res1.body).toHaveProperty("created_at");
      expect(res1.body).toHaveProperty("updated_at");
      expect(res1.body).toHaveProperty("description", wod.description);
      expect(res1.body).toHaveProperty("is_public", false);
      expect(res1.body).toHaveProperty("measurement", wod.measurement);
      expect(res1.body).toHaveProperty("name", wod.name);

      const res2: WorkoutResponse = await request.post(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: {
            score: 260,
            rx: false,
          },
        }
      );

      expect(res2.statusCode).toBe(StatusCodes.CREATED);
      expect(res2.body).toHaveProperty("workout_id", workoutId);
      expect(res2.body).toHaveProperty("created_at");
      expect(res2.body).toHaveProperty("updated_at");
      expect(res2.body).toHaveProperty("score", 260);
      expect(res2.body).toHaveProperty("rx", false);

      const res3: WorkoutResponse = await request.post(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: {
            score: 270,
            rx: false,
          },
        }
      );

      expect(res3.statusCode).toBe(StatusCodes.CREATED);
      expect(res3.body).toHaveProperty("workout_id", workoutId);
      expect(res3.body).toHaveProperty("score", 270);
      expect(res3.body).toHaveProperty("rx", false);

      const res4: WorkoutResponse = await request.post(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: {
            score: 270,
            rx: true,
          },
        }
      );

      expect(res4.statusCode).toBe(StatusCodes.CREATED);
      expect(res4.body).toHaveProperty("workout_id", workoutId);
      expect(res4.body).toHaveProperty("score", 270);
      expect(res4.body).toHaveProperty("rx", true);

      const res5: WorkoutResponse = await request.get(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res5.statusCode).toBe(StatusCodes.OK);
      expect(res5.body).toHaveProperty("scores");

      const scores = res5.body.scores.map(({ score, rx }) => ({ score, rx }));
      const expectedScores = [
        { score: 260, rx: false },
        { score: 270, rx: true },
        { score: 270, rx: false },
      ];
      expect(scores).toEqual(expectedScores);
    });

    it("should create a new for rounds workout and add scores to it and they should be sorted", async () => {
      const wod = {
        name: "Cindy",
        measurement: "rounds",
        description: "AMRAP20: 5 pull-ups, 10 push-ups, 15 squats",
      };

      const res1: WorkoutResponse = await request.post("/workouts", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          name: wod.name,
          measurement: wod.measurement,
          description: wod.description,
        },
      });

      expect(res1.statusCode).toBe(StatusCodes.CREATED);
      expect(res1.body).toHaveProperty("workout_id");
      const workoutId = res1.body.workout_id;
      expect(res1.body).toHaveProperty("created_at");
      expect(res1.body).toHaveProperty("updated_at");
      expect(res1.body).toHaveProperty("description", wod.description);
      expect(res1.body).toHaveProperty("is_public", false);
      expect(res1.body).toHaveProperty("measurement", wod.measurement);
      expect(res1.body).toHaveProperty("name", wod.name);

      const res2: WorkoutResponse = await request.post(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: { score: 20, rx: true },
        }
      );

      expect(res2.statusCode).toBe(StatusCodes.CREATED);
      expect(res2.body).toHaveProperty("workout_id", workoutId);
      expect(res2.body).toHaveProperty("created_at");
      expect(res2.body).toHaveProperty("updated_at");
      expect(res2.body).toHaveProperty("score", 20);
      expect(res2.body).toHaveProperty("rx", true);

      const res3: WorkoutResponse = await request.post(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: { score: 24, rx: false },
        }
      );

      expect(res3.statusCode).toBe(StatusCodes.CREATED);
      expect(res3.body).toHaveProperty("workout_id", workoutId);
      expect(res3.body).toHaveProperty("score", 24);
      expect(res3.body).toHaveProperty("rx", false);

      const res4: WorkoutResponse = await request.post(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: { score: 23, rx: true },
        }
      );

      expect(res4.statusCode).toBe(StatusCodes.CREATED);
      expect(res4.body).toHaveProperty("workout_id", workoutId);
      expect(res4.body).toHaveProperty("score", 23);
      expect(res4.body).toHaveProperty("rx", true);

      const res5: WorkoutResponse = await request.get(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res5.statusCode).toBe(StatusCodes.OK);
      expect(res5.body).toHaveProperty("scores");
      const scores = res5.body.scores.map(({ score, rx }) => ({ score, rx }));
      const expectedScores = [
        { score: 24, rx: false },
        { score: 23, rx: true },
        { score: 20, rx: true },
      ];
      expect(scores).toEqual(expectedScores);
    });

    it("should updated an existing workout score", async () => {
      const wod = {
        name: "Heavy Fran",
        measurement: "time",
        description: "15-12-9 Thruster (60kg / 45kg) / Chest to bar (weighted)",
      };

      const res1: WorkoutResponse = await request.post("/workouts", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          name: wod.name,
          measurement: wod.measurement,
          description: wod.description,
        },
      });

      expect(res1.statusCode).toBe(StatusCodes.CREATED);
      expect(res1.body).toHaveProperty("workout_id");
      const workoutId = res1.body.workout_id;
      expect(res1.body).toHaveProperty("created_at");
      expect(res1.body).toHaveProperty("updated_at");
      expect(res1.body).toHaveProperty("description", wod.description);
      expect(res1.body).toHaveProperty("is_public", false);
      expect(res1.body).toHaveProperty("measurement", wod.measurement);
      expect(res1.body).toHaveProperty("name", wod.name);

      const res2: WorkoutResponse = await request.post(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: {
            score: 260,
            rx: false,
          },
        }
      );

      expect(res2.statusCode).toBe(StatusCodes.CREATED);
      expect(res2.body).toHaveProperty("workout_id", workoutId);
      expect(res2.body).toHaveProperty("created_at");
      expect(res2.body).toHaveProperty("updated_at");
      expect(res2.body).toHaveProperty("score", 260);
      expect(res2.body).toHaveProperty("rx", false);

      const res3: WorkoutResponse = await request.get(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res3.statusCode).toBe(StatusCodes.OK);
      expect(res3.body).toHaveProperty("scores");
      expect(res3.body.scores[0]).toHaveProperty("workout_score_id");
      expect(res3.body.scores[0]).toHaveProperty("workout_id", workoutId);
      expect(res3.body.scores[0]).toHaveProperty("created_at");
      expect(res3.body.scores[0]).toHaveProperty("updated_at");
      expect(res3.body.scores[0]).toHaveProperty("score", 260);
      expect(res3.body.scores[0]).toHaveProperty("rx", false);

      const workoutScore = res3.body.scores[0];

      const res4: WorkoutScoreResponse = await request.patch(
        `/workouts/${workoutId}/${workoutScore.workout_score_id}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: {
            score: 250,
            rx: true,
            notes: "Deadly!",
          },
        }
      );

      expect(res4.statusCode).toBe(StatusCodes.OK);
      expect(res4.body).toHaveProperty("workout_id", workoutId);
      expect(res4.body).toHaveProperty("created_at");
      expect(res4.body).toHaveProperty("updated_at");
      expect(res4.body).toHaveProperty("score", 250);
      expect(res4.body).toHaveProperty("rx", true);
      expect(res4.body).toHaveProperty("notes", "Deadly!");
    });

    it("should delete an existing workout score", async () => {
      const wod = {
        name: "Heavy Fran",
        measurement: "time",
        description: "15-12-9 Thruster (60kg / 45kg) / Chest to bar (weighted)",
      };

      const res1: WorkoutResponse = await request.post("/workouts", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          name: wod.name,
          measurement: wod.measurement,
          description: wod.description,
        },
      });

      expect(res1.statusCode).toBe(StatusCodes.CREATED);
      expect(res1.body).toHaveProperty("workout_id");
      const workoutId = res1.body.workout_id;
      expect(res1.body).toHaveProperty("created_at");
      expect(res1.body).toHaveProperty("updated_at");
      expect(res1.body).toHaveProperty("description", wod.description);
      expect(res1.body).toHaveProperty("is_public", false);
      expect(res1.body).toHaveProperty("measurement", wod.measurement);
      expect(res1.body).toHaveProperty("name", wod.name);

      const res2: WorkoutResponse = await request.post(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: {
            score: 260,
            rx: false,
          },
        }
      );

      expect(res2.statusCode).toBe(StatusCodes.CREATED);
      expect(res2.body).toHaveProperty("workout_id", workoutId);
      expect(res2.body).toHaveProperty("created_at");
      expect(res2.body).toHaveProperty("updated_at");
      expect(res2.body).toHaveProperty("score", 260);
      expect(res2.body).toHaveProperty("rx", false);

      const res3: WorkoutResponse = await request.get(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res3.statusCode).toBe(StatusCodes.OK);
      expect(res3.body).toHaveProperty("scores");
      expect(res3.body.scores[0]).toHaveProperty("workout_score_id");
      expect(res3.body.scores[0]).toHaveProperty("workout_id", workoutId);
      expect(res3.body.scores[0]).toHaveProperty("created_at");
      expect(res3.body.scores[0]).toHaveProperty("updated_at");
      expect(res3.body.scores[0]).toHaveProperty("score", 260);
      expect(res3.body.scores[0]).toHaveProperty("rx", false);

      const workoutScore = res3.body.scores[0];

      const res4: WorkoutScoreResponse = await request.delete(
        `/workouts/${workoutId}/${workoutScore.workout_score_id}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res4.statusCode).toBe(StatusCodes.NO_CONTENT);

      const res5: WorkoutScoreResponse = await request.get(
        `/workouts/${workoutId}/${workoutScore.workout_score_id}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res5.statusCode).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe("user separated workouts", () => {
    it("should not return workouts created by other users", async () => {
      const wod = {
        name: "Annie",
        measurement: "time",
        description: "50-40-30-20-10 Double unders / Sit ups",
      };

      const res1: WorkoutResponse = await request.post("/workouts", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          name: wod.name,
          measurement: wod.measurement,
          description: wod.description,
        },
      });

      expect(res1.statusCode).toBe(StatusCodes.CREATED);
      expect(res1.body).toHaveProperty("workout_id");
      const workoutId = res1.body.workout_id;
      expect(res1.body).toHaveProperty("name", wod.name);
      expect(res1.body).toHaveProperty("description", wod.description);
      expect(res1.body).toHaveProperty("measurement", wod.measurement);
      expect(res1.body).toHaveProperty("is_public", false);
      expect(res1.body).toHaveProperty("created_at");
      expect(res1.body).toHaveProperty("updated_at");

      const res2: WorkoutResponse = await request.get(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res2.statusCode).toBe(StatusCodes.OK);
      expect(res2.body).toHaveProperty("workout_id");
      expect(res2.body).toHaveProperty("name", wod.name);
      expect(res2.body).toHaveProperty("description", wod.description);
      expect(res2.body).toHaveProperty("measurement", wod.measurement);
      expect(res2.body).toHaveProperty("is_public", false);
      expect(res2.body).toHaveProperty("created_at");
      expect(res2.body).toHaveProperty("updated_at");

      const res3: WorkoutResponse = await request.get(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      expect(res3.statusCode).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe("public workouts", () => {
    it("should return workouts created by other users if they are marked as is_public", async () => {
      const wod = {
        name: "Annie",
        measurement: "time",
        description: "50-40-30-20-10 Double unders / Sit ups",
        is_public: true,
      };

      const res1: WorkoutResponse = await request.post("/workouts", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: wod,
      });

      expect(res1.statusCode).toBe(StatusCodes.CREATED);
      expect(res1.body).toHaveProperty("workout_id");
      const workoutId = res1.body.workout_id;
      expect(res1.body).toHaveProperty("name", wod.name);
      expect(res1.body).toHaveProperty("description", wod.description);
      expect(res1.body).toHaveProperty("measurement", wod.measurement);
      expect(res1.body).toHaveProperty("is_public", true);
      expect(res1.body).toHaveProperty("created_at");
      expect(res1.body).toHaveProperty("updated_at");

      const res2: WorkoutResponse = await request.get(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res2.statusCode).toBe(StatusCodes.OK);
      expect(res2.body).toHaveProperty("workout_id");
      expect(res2.body).toHaveProperty("name", wod.name);
      expect(res2.body).toHaveProperty("description", wod.description);
      expect(res2.body).toHaveProperty("measurement", wod.measurement);
      expect(res2.body).toHaveProperty("is_public", true);
      expect(res2.body).toHaveProperty("created_at");
      expect(res2.body).toHaveProperty("updated_at");

      const res3: WorkoutResponse = await request.get(
        `/workouts/${workoutId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      expect(res3.statusCode).toBe(StatusCodes.OK);
      expect(res2.body).toHaveProperty("workout_id");
      expect(res2.body).toHaveProperty("name", wod.name);
      expect(res2.body).toHaveProperty("description", wod.description);
      expect(res2.body).toHaveProperty("measurement", wod.measurement);
      expect(res2.body).toHaveProperty("is_public", true);
      expect(res2.body).toHaveProperty("created_at");
      expect(res2.body).toHaveProperty("updated_at");
    });
  });
});
