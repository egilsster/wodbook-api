import { MongoClient, Db } from "mongodb";
import { StatusCodes } from "http-status-codes";
import { createUsers, getMongoClient } from "./common";
import { LoginData, LoginPayload } from "./types/user";
import {
  ManyWorkoutsData,
  WorkoutData,
  WorkoutScoreData,
} from "./types/workout";

const baseUrl = `${process.env.API_URL || "http://127.0.0.1:43210"}/v1`;

describe("/v1/workouts", () => {
  let mongoClient: MongoClient;
  let db: Db;

  let userToken: string;
  let adminToken: string;

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
      const res1 = await fetch(`${baseUrl}/workouts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body1: ManyWorkoutsData = await res1.json();

      expect(res1.status).toBe(StatusCodes.OK);
      expect(body1).toHaveProperty("data");
      const workouts = body1.data;
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
      const res0 = await fetch(`${baseUrl}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(placeholder_wod),
      });
      expect(res0.status).toBe(StatusCodes.CREATED);

      const res1 = await fetch(`${baseUrl}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(wod),
      });
      const body1: WorkoutData = await res1.json();

      expect(res1.status).toBe(StatusCodes.CREATED);
      expect(body1).toHaveProperty("workout_id");
      const workoutId = body1.workout_id;
      expect(body1).toHaveProperty("name", wod.name);
      expect(body1).toHaveProperty("description", wod.description);
      expect(body1).toHaveProperty("measurement", wod.measurement);
      expect(body1).toHaveProperty("is_public", false);
      expect(body1).toHaveProperty("created_at");
      expect(body1).toHaveProperty("updated_at");

      const res2 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "GET",
        headers: {
          // "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body2: WorkoutData = await res2.json();

      expect(res2.status).toBe(StatusCodes.OK);
      expect(body2).toHaveProperty("workout_id");
      expect(body2).toHaveProperty("name", wod.name);
      expect(body2).toHaveProperty("description", wod.description);
      expect(body2).toHaveProperty("measurement", wod.measurement);
      expect(body2).toHaveProperty("is_public", false);
      expect(body2).toHaveProperty("created_at");
      expect(body2).toHaveProperty("updated_at");

      const res3 = await fetch(`${baseUrl}/workouts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      expect(res3.status).toBe(StatusCodes.OK);
      const body3 = await res3.json();
      expect(body3).toHaveProperty("data");
      const workouts = body3.data;
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

      const res1 = await fetch(`${baseUrl}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(workout),
      });
      const body1: WorkoutData = await res1.json();

      expect(res1.status).toBe(StatusCodes.CREATED);
      expect(body1).toHaveProperty("workout_id");
      expect(body1).toHaveProperty("name", workout.name);
      expect(body1).toHaveProperty("description", workout.description);
      expect(body1).toHaveProperty("measurement", workout.measurement);
      expect(body1).toHaveProperty("is_public", false);
      expect(body1).toHaveProperty("created_at");
      expect(body1).toHaveProperty("updated_at");

      const res2 = await fetch(`${baseUrl}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(workout),
      });
      expect(res2.status).toBe(StatusCodes.CONFLICT);
    });

    it("should get 422 Unprocessable Entity if using an invalid measurement", async () => {
      const res = await fetch(`${baseUrl}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          name: "My workout",
          measurement: "invalid-measurement",
          description: "workout description",
        }),
      });

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
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

      const res1 = await fetch(`${baseUrl}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(wod),
      });
      const body1: WorkoutData = await res1.json();

      expect(res1.status).toBe(StatusCodes.CREATED);
      expect(body1).toHaveProperty("workout_id");
      const workoutId = body1.workout_id;
      expect(body1).toHaveProperty("name", wod.name);
      expect(body1).toHaveProperty("description", wod.description);
      expect(body1).toHaveProperty("measurement", wod.measurement);
      expect(body1).toHaveProperty("is_public", false);
      expect(body1).toHaveProperty("created_at");
      expect(body1).toHaveProperty("updated_at");

      const res2 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body2: WorkoutData = await res2.json();

      expect(res2.status).toBe(StatusCodes.OK);
      expect(body2).toHaveProperty("workout_id");
      expect(body2).toHaveProperty("name", wod.name);
      expect(body2).toHaveProperty("description", wrongDesc);
      expect(body2).toHaveProperty("measurement", wod.measurement);
      expect(body2).toHaveProperty("is_public", false);
      expect(body2).toHaveProperty("created_at");
      expect(body2).toHaveProperty("updated_at");
      expect(body2.created_at).toEqual(body2.updated_at);

      const res3 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          name: "Fran!",
          description: correctDesc,
        }),
      });
      const body3: WorkoutData = await res3.json();

      expect(res3.status).toBe(StatusCodes.OK);
      expect(body3).toHaveProperty("workout_id");
      expect(body3).toHaveProperty("name", "Fran!");
      expect(body3).toHaveProperty("description", correctDesc);
      expect(body3).toHaveProperty("measurement", wod.measurement);
      expect(body3).toHaveProperty("is_public", false);
      expect(body3).toHaveProperty("created_at");
      expect(body3).toHaveProperty("updated_at");
      expect(body3.created_at).not.toEqual(body3.updated_at);

      const res4 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body4: WorkoutData = await res4.json();

      expect(res4.status).toBe(StatusCodes.OK);
      expect(body4).toHaveProperty("workout_id");
      expect(body4).toHaveProperty("name", "Fran!");
      expect(body4).toHaveProperty("description", correctDesc);
      expect(body4).toHaveProperty("measurement", wod.measurement);
      expect(body4).toHaveProperty("is_public", false);
      expect(body4).toHaveProperty("created_at");
      expect(body4).toHaveProperty("updated_at");
      expect(body4.created_at).not.toEqual(body4.updated_at);
    });

    it("should get 409 Conflict if you set to a name that already exists", async () => {
      const wod = {
        name: "Fran",
        measurement: "time",
        description: "21-15-9 Thruster (42.5kg / 30kg) / Pull ups",
      };

      const res1 = await fetch(`${baseUrl}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(wod),
      });

      const body1: WorkoutData = await res1.json();
      expect(res1.status).toBe(StatusCodes.CREATED);
      expect(body1).toHaveProperty("workout_id");
      const workoutId = body1.workout_id;
      expect(body1).toHaveProperty("name", wod.name);
      expect(body1).toHaveProperty("description", wod.description);
      expect(body1).toHaveProperty("measurement", wod.measurement);

      const res2 = await fetch(`${baseUrl}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          ...wod,
          name: "Fran!",
        }),
      });
      const body2: WorkoutData = await res2.json();

      expect(res2.status).toBe(StatusCodes.CREATED);
      expect(body2).toHaveProperty("name", "Fran!");

      const res3 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          name: "Fran",
        }),
      });

      expect(res3.status).toBe(StatusCodes.CONFLICT);

      const res4 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body4: WorkoutData = await res4.json();

      expect(res4.status).toBe(StatusCodes.OK);
      expect(body4).toHaveProperty("name", "Fran");
    });
  });

  describe("deleting workouts", () => {
    it("should delete a workout and its scores", async () => {
      const wod = {
        name: "Fran",
        measurement: "time",
        description: "21-15-9 Thruster (42.5kg / 30kg) / Pull ups",
      };

      const res1 = await fetch(`${baseUrl}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(wod),
      });
      const body1: WorkoutData = await res1.json();

      expect(res1.status).toBe(StatusCodes.CREATED);
      expect(body1).toHaveProperty("workout_id");
      const workoutId = body1.workout_id;

      const res2 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          score: 260,
          rx: true,
        }),
      });
      const body2: WorkoutScoreData = await res2.json();

      expect(res2.status).toBe(StatusCodes.CREATED);
      const workoutScoreId = body2.workout_score_id;

      const res3 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      expect(res3.status).toBe(StatusCodes.OK);

      const res4 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      expect(res4.status).toBe(StatusCodes.NO_CONTENT);

      const res5 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      expect(res5.status).toBe(StatusCodes.NOT_FOUND);

      const res6 = await fetch(
        `${baseUrl}/workouts/${workoutId}/${workoutScoreId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res6.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe("workout scores", () => {
    it("should create a new workout and add scores to it", async () => {
      const wod = {
        name: "Heavy Fran",
        measurement: "time",
        description: "15-12-9 Thruster (60kg / 45kg) / Chest to bar (weighted)",
      };

      const res1 = await fetch(`${baseUrl}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(wod),
      });
      const body1: WorkoutData = await res1.json();

      expect(res1.status).toBe(StatusCodes.CREATED);
      expect(body1).toHaveProperty("workout_id");
      const workoutId = body1.workout_id;
      expect(body1).toHaveProperty("created_at");
      expect(body1).toHaveProperty("updated_at");
      expect(body1).toHaveProperty("description", wod.description);
      expect(body1).toHaveProperty("is_public", false);
      expect(body1).toHaveProperty("measurement", wod.measurement);
      expect(body1).toHaveProperty("name", wod.name);

      const res2 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          score: 260,
          rx: false,
        }),
      });
      const body2: WorkoutData = await res2.json();

      expect(res2.status).toBe(StatusCodes.CREATED);
      expect(body2).toHaveProperty("workout_id", workoutId);
      expect(body2).toHaveProperty("created_at");
      expect(body2).toHaveProperty("updated_at");
      expect(body2).toHaveProperty("score", 260);
      expect(body2).toHaveProperty("rx", false);

      const res3 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          score: 270,
          rx: false,
        }),
      });

      const body3: WorkoutScoreData = await res3.json();
      expect(res3.status).toBe(StatusCodes.CREATED);
      expect(body3).toHaveProperty("workout_id", workoutId);
      expect(body3).toHaveProperty("score", 270);
      expect(body3).toHaveProperty("rx", false);

      const res4 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          score: 270,
          rx: true,
        }),
      });
      const body4: WorkoutData = await res4.json();

      expect(res4.status).toBe(StatusCodes.CREATED);
      expect(body4).toHaveProperty("workout_id", workoutId);
      expect(body4).toHaveProperty("score", 270);
      expect(body4).toHaveProperty("rx", true);

      const res5 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body5: WorkoutData = await res5.json();

      expect(res5.status).toBe(StatusCodes.OK);
      expect(body5).toHaveProperty("scores");

      const scores = body5.scores.map(({ score, rx }) => ({ score, rx }));
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

      const res1 = await fetch(`${baseUrl}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          name: wod.name,
          measurement: wod.measurement,
          description: wod.description,
        }),
      });
      const body1: WorkoutData = await res1.json();

      expect(res1.status).toBe(StatusCodes.CREATED);
      expect(body1).toHaveProperty("workout_id");
      const workoutId = body1.workout_id;
      expect(body1).toHaveProperty("created_at");
      expect(body1).toHaveProperty("updated_at");
      expect(body1).toHaveProperty("description", wod.description);
      expect(body1).toHaveProperty("is_public", false);
      expect(body1).toHaveProperty("measurement", wod.measurement);
      expect(body1).toHaveProperty("name", wod.name);

      const res2 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ score: 20, rx: true }),
      });
      const body2: WorkoutData = await res2.json();

      expect(res2.status).toBe(StatusCodes.CREATED);
      expect(body2).toHaveProperty("workout_id", workoutId);
      expect(body2).toHaveProperty("created_at");
      expect(body2).toHaveProperty("updated_at");
      expect(body2).toHaveProperty("score", 20);
      expect(body2).toHaveProperty("rx", true);

      const res3 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ score: 24, rx: false }),
      });
      const body3: WorkoutData = await res3.json();

      expect(res3.status).toBe(StatusCodes.CREATED);
      expect(body3).toHaveProperty("workout_id", workoutId);
      expect(body3).toHaveProperty("score", 24);
      expect(body3).toHaveProperty("rx", false);

      const res4 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ score: 23, rx: true }),
      });
      const body4: WorkoutData = await res4.json();

      expect(res4.status).toBe(StatusCodes.CREATED);
      expect(body4).toHaveProperty("workout_id", workoutId);
      expect(body4).toHaveProperty("score", 23);
      expect(body4).toHaveProperty("rx", true);

      const res5 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body5: WorkoutData = await res5.json();

      expect(res5.status).toBe(StatusCodes.OK);
      expect(body5).toHaveProperty("scores");
      const scores = body5.scores.map(({ score, rx }) => ({ score, rx }));
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

      const res1 = await fetch(`${baseUrl}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          name: wod.name,
          measurement: wod.measurement,
          description: wod.description,
        }),
      });
      const body1: WorkoutData = await res1.json();

      expect(res1.status).toBe(StatusCodes.CREATED);
      expect(body1).toHaveProperty("workout_id");
      const workoutId = body1.workout_id;
      expect(body1).toHaveProperty("created_at");
      expect(body1).toHaveProperty("updated_at");
      expect(body1).toHaveProperty("description", wod.description);
      expect(body1).toHaveProperty("is_public", false);
      expect(body1).toHaveProperty("measurement", wod.measurement);
      expect(body1).toHaveProperty("name", wod.name);

      const res2 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          score: 260,
          rx: false,
        }),
      });
      const body2: WorkoutData = await res2.json();

      expect(res2.status).toBe(StatusCodes.CREATED);
      expect(body2).toHaveProperty("workout_id", workoutId);
      expect(body2).toHaveProperty("created_at");
      expect(body2).toHaveProperty("updated_at");
      expect(body2).toHaveProperty("score", 260);
      expect(body2).toHaveProperty("rx", false);

      const res3 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body3: WorkoutData = await res3.json();

      expect(res3.status).toBe(StatusCodes.OK);
      expect(body3).toHaveProperty("scores");
      expect(body3.scores[0]).toHaveProperty("workout_score_id");
      expect(body3.scores[0]).toHaveProperty("workout_id", workoutId);
      expect(body3.scores[0]).toHaveProperty("created_at");
      expect(body3.scores[0]).toHaveProperty("updated_at");
      expect(body3.scores[0]).toHaveProperty("score", 260);
      expect(body3.scores[0]).toHaveProperty("rx", false);

      const workoutScore = body3.scores[0];

      const res4 = await fetch(
        `${baseUrl}/workouts/${workoutId}/${workoutScore.workout_score_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            score: 250,
            rx: true,
            notes: "Deadly!",
          }),
        }
      );
      const body4: WorkoutData = await res4.json();

      expect(res4.status).toBe(StatusCodes.OK);
      expect(body4).toHaveProperty("workout_id", workoutId);
      expect(body4).toHaveProperty("created_at");
      expect(body4).toHaveProperty("updated_at");
      expect(body4).toHaveProperty("score", 250);
      expect(body4).toHaveProperty("rx", true);
      expect(body4).toHaveProperty("notes", "Deadly!");
    });

    it("should delete an existing workout score", async () => {
      const wod = {
        name: "Heavy Fran",
        measurement: "time",
        description: "15-12-9 Thruster (60kg / 45kg) / Chest to bar (weighted)",
      };

      const res1 = await fetch(`${baseUrl}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          name: wod.name,
          measurement: wod.measurement,
          description: wod.description,
        }),
      });
      const body1: WorkoutData = await res1.json();

      expect(res1.status).toBe(StatusCodes.CREATED);
      expect(body1).toHaveProperty("workout_id");
      const workoutId = body1.workout_id;
      expect(body1).toHaveProperty("created_at");
      expect(body1).toHaveProperty("updated_at");
      expect(body1).toHaveProperty("description", wod.description);
      expect(body1).toHaveProperty("is_public", false);
      expect(body1).toHaveProperty("measurement", wod.measurement);
      expect(body1).toHaveProperty("name", wod.name);

      const res2 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          score: 260,
          rx: false,
        }),
      });

      const body2: WorkoutScoreData = await res2.json();
      expect(res2.status).toBe(StatusCodes.CREATED);
      expect(body2).toHaveProperty("workout_id", workoutId);
      expect(body2).toHaveProperty("created_at");
      expect(body2).toHaveProperty("updated_at");
      expect(body2).toHaveProperty("score", 260);
      expect(body2).toHaveProperty("rx", false);

      const res3 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body3: WorkoutData = await res3.json();

      expect(res3.status).toBe(StatusCodes.OK);
      expect(body3).toHaveProperty("scores");
      expect(body3.scores[0]).toHaveProperty("workout_id");
      expect(body3.scores[0]).toHaveProperty("workout_score_id");
      expect(body3.scores[0]).toHaveProperty("score");
      expect(body3.scores[0]).toHaveProperty("created_at");
      expect(body3.scores[0]).toHaveProperty("updated_at");

      const workoutScore = body3.scores[0];

      const res4 = await fetch(
        `${baseUrl}/workouts/${workoutId}/${workoutScore.workout_score_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res4.status).toBe(StatusCodes.NO_CONTENT);

      const res5 = await fetch(
        `${baseUrl}/workouts/${workoutId}/${workoutScore.workout_score_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      expect(res5.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe("user separated workouts", () => {
    it("should not return workouts created by other users", async () => {
      const wod = {
        name: "Annie",
        measurement: "time",
        description: "50-40-30-20-10 Double unders / Sit ups",
      };

      const res1 = await fetch(`${baseUrl}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          name: wod.name,
          measurement: wod.measurement,
          description: wod.description,
        }),
      });
      const body1: WorkoutData = await res1.json();

      expect(res1.status).toBe(StatusCodes.CREATED);
      expect(body1).toHaveProperty("workout_id");
      const workoutId = body1.workout_id;
      expect(body1).toHaveProperty("name", wod.name);
      expect(body1).toHaveProperty("description", wod.description);
      expect(body1).toHaveProperty("measurement", wod.measurement);
      expect(body1).toHaveProperty("is_public", false);
      expect(body1).toHaveProperty("created_at");
      expect(body1).toHaveProperty("updated_at");

      const res2 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body2: WorkoutData = await res2.json();

      expect(res2.status).toBe(StatusCodes.OK);
      expect(body2).toHaveProperty("workout_id");
      expect(body2).toHaveProperty("name", wod.name);
      expect(body2).toHaveProperty("description", wod.description);
      expect(body2).toHaveProperty("measurement", wod.measurement);
      expect(body2).toHaveProperty("is_public", false);
      expect(body2).toHaveProperty("created_at");
      expect(body2).toHaveProperty("updated_at");

      const res3 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      expect(res3.status).toBe(StatusCodes.NOT_FOUND);
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

      const res1 = await fetch(`${baseUrl}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(wod),
      });
      const body1: WorkoutData = await res1.json();

      expect(res1.status).toBe(StatusCodes.CREATED);
      expect(body1).toHaveProperty("workout_id");
      const workoutId = body1.workout_id;
      expect(body1).toHaveProperty("name", wod.name);
      expect(body1).toHaveProperty("description", wod.description);
      expect(body1).toHaveProperty("measurement", wod.measurement);
      expect(body1).toHaveProperty("is_public", true);
      expect(body1).toHaveProperty("created_at");
      expect(body1).toHaveProperty("updated_at");

      const res2 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body2: WorkoutData = await res2.json();

      expect(res2.status).toBe(StatusCodes.OK);
      expect(body2).toHaveProperty("workout_id");
      expect(body2).toHaveProperty("name", wod.name);
      expect(body2).toHaveProperty("description", wod.description);
      expect(body2).toHaveProperty("measurement", wod.measurement);
      expect(body2).toHaveProperty("is_public", true);
      expect(body2).toHaveProperty("created_at");
      expect(body2).toHaveProperty("updated_at");

      const res3 = await fetch(`${baseUrl}/workouts/${workoutId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      expect(res3.status).toBe(StatusCodes.OK);
      expect(body2).toHaveProperty("workout_id");
      expect(body2).toHaveProperty("name", wod.name);
      expect(body2).toHaveProperty("description", wod.description);
      expect(body2).toHaveProperty("measurement", wod.measurement);
      expect(body2).toHaveProperty("is_public", true);
      expect(body2).toHaveProperty("created_at");
      expect(body2).toHaveProperty("updated_at");
    });
  });
});
