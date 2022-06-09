import { MongoClient, Db } from "mongodb";
import * as request from "request-promise-native";
import { StatusCodes } from "http-status-codes";
import { createUsers, getMongoClient } from "./common";

describe("/v1/movements", () => {
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
    await db.collection("movements").deleteMany({});
    await db.collection("movementscores").deleteMany({});
  });

  afterAll(async () => {
    await mongoClient.close();
  });

  describe("listing movements", () => {
    it("should return 200 OK with a list", async () => {
      const res1: ManyMovementsResponse = await request.get("/movements", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      expect(res1.statusCode).toBe(StatusCodes.OK);
      expect(res1.body).toHaveProperty("data");
      const movements = res1.body.data;
      expect(movements).toHaveProperty("length", 0);
    });
  });

  describe("creating movements", () => {
    it("should get 201 Created when creating a new movement", async () => {
      const movement = {
        name: "Snatch",
        measurement: "weight",
      };

      const placeholder_movement = {
        name: "A placeholder",
        measurement: "weight",
        is_public: true,
      };
      const res0: MovementResponse = await request.post("/movements", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: placeholder_movement,
      });

      expect(res0.statusCode).toBe(StatusCodes.CREATED);

      const res1: MovementResponse = await request.post("/movements", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          name: movement.name,
          measurement: movement.measurement,
        },
      });

      expect(res1.statusCode).toBe(StatusCodes.CREATED);
      expect(res1.body).toHaveProperty("movement_id");
      const movementId = res1.body.movement_id;
      expect(res1.body).toHaveProperty("created_at");
      expect(res1.body).toHaveProperty("updated_at");
      expect(res1.body).toHaveProperty("measurement", movement.measurement);
      expect(res1.body).toHaveProperty("name", movement.name);

      const res2: MovementResponse = await request.get(
        `/movements/${movementId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res2.statusCode).toBe(StatusCodes.OK);
      expect(res2.body).toHaveProperty("movement_id");
      expect(res2.body).toHaveProperty("created_at");
      expect(res2.body).toHaveProperty("updated_at");
      expect(res2.body).toHaveProperty("measurement", movement.measurement);
      expect(res2.body).toHaveProperty("name", movement.name);

      const res3: ManyMovementsResponse = await request.get("/movements", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      expect(res3.statusCode).toBe(StatusCodes.OK);
      expect(res3.body).toHaveProperty("data");
      const movements = res3.body.data;
      expect(movements).toHaveProperty("length", 2);
      const [movement1, movement2] = movements;
      expect(movement1).toHaveProperty("name", placeholder_movement.name);
      expect(movement2).toHaveProperty("movement_id");
      expect(movement2).toHaveProperty("name", movement.name);
      expect(movement2).toHaveProperty("measurement", movement.measurement);
      expect(movement2).toHaveProperty("is_public", false);
      expect(movement2).toHaveProperty("created_at");
      expect(movement2).toHaveProperty("updated_at");
    });

    it("should get 409 Conflict if creating the same movement more than once", async () => {
      const movement = {
        name: "Thruster",
        measurement: "weight",
      };

      const payload = {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: movement,
      };

      const res1: MovementResponse = await request.post("/movements", payload);

      expect(res1.statusCode).toBe(StatusCodes.CREATED);
      expect(res1.body).toHaveProperty("movement_id");
      expect(res1.body).toHaveProperty("created_at");
      expect(res1.body).toHaveProperty("updated_at");
      expect(res1.body).toHaveProperty("measurement", movement.measurement);
      expect(res1.body).toHaveProperty("name", movement.name);

      const res2: MovementResponse = await request.post("/movements", payload);

      expect(res2.statusCode).toBe(StatusCodes.CONFLICT);
    });

    it("should get 422 Unprocessable Entity if an invalid measurement", async () => {
      const res: MovementResponse = await request.post("/movements", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          name: "my-movement",
          measurement: "invalid-measure",
        },
      });

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });
  });

  describe("updating movements", () => {
    it("should be able to movement name", async () => {
      const movement = {
        name: "Sholder Press",
        measurement: "weight",
      };

      const res1: MovementResponse = await request.post("/movements", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: movement,
      });

      expect(res1.statusCode).toBe(StatusCodes.CREATED);
      expect(res1.body).toHaveProperty("movement_id");
      const movementId = res1.body.movement_id;
      expect(res1.body).toHaveProperty("name", movement.name);
      expect(res1.body).toHaveProperty("measurement", movement.measurement);
      expect(res1.body).toHaveProperty("is_public", false);
      expect(res1.body).toHaveProperty("created_at");
      expect(res1.body).toHaveProperty("updated_at");

      const res2: MovementResponse = await request.get(
        `/movements/${movementId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res2.statusCode).toBe(StatusCodes.OK);
      expect(res2.body).toHaveProperty("movement_id");
      expect(res2.body).toHaveProperty("name", movement.name);
      expect(res2.body).toHaveProperty("measurement", movement.measurement);
      expect(res2.body).toHaveProperty("is_public", false);
      expect(res2.body).toHaveProperty("created_at");
      expect(res2.body).toHaveProperty("updated_at");
      expect(res2.body.created_at).toEqual(res2.body.updated_at);

      const res3: MovementResponse = await request.patch(
        `/movements/${movementId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: {
            name: "Shoulder Press",
          },
        }
      );

      expect(res3.statusCode).toBe(StatusCodes.OK);
      expect(res3.body).toHaveProperty("movement_id");
      expect(res3.body).toHaveProperty("name", "Shoulder Press");
      expect(res3.body).toHaveProperty("measurement", movement.measurement);
      expect(res3.body).toHaveProperty("is_public", false);
      expect(res3.body).toHaveProperty("created_at");
      expect(res3.body).toHaveProperty("updated_at");
      expect(res3.body.created_at).not.toEqual(res3.body.updated_at);

      const res4: MovementResponse = await request.get(
        `/movements/${movementId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res4.statusCode).toBe(StatusCodes.OK);
      expect(res4.body).toHaveProperty("movement_id");
      expect(res4.body).toHaveProperty("name", "Shoulder Press");
      expect(res4.body).toHaveProperty("measurement", movement.measurement);
      expect(res4.body).toHaveProperty("is_public", false);
      expect(res4.body).toHaveProperty("created_at");
      expect(res4.body).toHaveProperty("updated_at");
      expect(res4.body.created_at).not.toEqual(res4.body.updated_at);
    });

    it("should get 409 Conflict if you set to a name that already exists", async () => {
      const movement = {
        name: "Shoulder Press",
        measurement: "weight",
      };

      const res1: MovementResponse = await request.post("/movements", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          name: "Sholder Press",
          measurement: "weight",
        },
      });

      expect(res1.statusCode).toBe(StatusCodes.CREATED);
      expect(res1.body).toHaveProperty("movement_id");
      const movementId = res1.body.movement_id;
      expect(res1.body).toHaveProperty("name", "Sholder Press");

      const res2: MovementResponse = await request.post("/movements", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: movement,
      });

      expect(res2.statusCode).toBe(StatusCodes.CREATED);
      expect(res2.body).toHaveProperty("name", "Shoulder Press");

      const res3: MovementResponse = await request.patch(
        `/movements/${movementId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: {
            name: "Shoulder Press",
          },
        }
      );

      expect(res3.statusCode).toBe(StatusCodes.CONFLICT);

      const res4: MovementResponse = await request.get(
        `/movements/${movementId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res4.statusCode).toBe(StatusCodes.OK);
      expect(res4.body).toHaveProperty("name", "Sholder Press");
    });
  });

  describe("deleting movements", () => {
    it("should delete a movement and its scores", async () => {
      const movement = {
        name: "Snatch",
        measurement: "weight",
      };

      const res1: MovementResponse = await request.post("/movements", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: movement,
      });

      expect(res1.statusCode).toBe(StatusCodes.CREATED);
      expect(res1.body).toHaveProperty("movement_id");
      const movementId = res1.body.movement_id;

      const res2: MovementScoreResponse = await request.post(
        `/movements/${movementId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: {
            score: 100,
          },
        }
      );

      expect(res2.statusCode).toBe(StatusCodes.CREATED);
      const movementScoreId = res2.body.movement_score_id;

      const res3: MovementResponse = await request.get(
        `/movements/${movementId}`,
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
        `/movements/${movementId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res4.statusCode).toBe(StatusCodes.NO_CONTENT);

      const res5: MovementResponse = await request.get(
        `/movements/${movementId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res5.statusCode).toBe(StatusCodes.NOT_FOUND);

      const res6: MovementScoreResponse = await request.get(
        `/movements/${movementId}/${movementScoreId}`,
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

  describe("movement scores", () => {
    it("should create a new movement and add a score for it", async () => {
      const movement = {
        name: "Deadlift",
        measurement: "weight",
      };

      const res1: MovementResponse = await request.post("/movements", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          name: movement.name,
          measurement: movement.measurement,
        },
      });

      expect(res1.statusCode).toBe(StatusCodes.CREATED);
      expect(res1.body).toHaveProperty("movement_id");
      const movementId = res1.body.movement_id;
      expect(res1.body).toHaveProperty("name", movement.name);
      expect(res1.body).toHaveProperty("measurement", movement.measurement);
      expect(res1.body).toHaveProperty("created_at");
      expect(res1.body).toHaveProperty("updated_at");

      const res2: MovementResponse = await request.post(
        `/movements/${movementId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: {
            score: 200,
            measurement: "weight",
          },
        }
      );

      expect(res2.statusCode).toBe(StatusCodes.CREATED);
      expect(res2.body).toHaveProperty("movement_score_id");
      expect(res2.body).toHaveProperty("movement_id", movementId);
      expect(res2.body).toHaveProperty("score", 200);
      expect(res2.body).toHaveProperty("created_at");
      expect(res2.body).toHaveProperty("updated_at");

      const res3: MovementResponse = await request.get(
        `/movements/${movementId}`,
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
      expect(res3.body.scores[0]).toHaveProperty("movement_id");
      expect(res3.body.scores[0]).toHaveProperty("movement_score_id");
      expect(res3.body.scores[0]).toHaveProperty("score");
      expect(res3.body.scores[0]).toHaveProperty("created_at");
      expect(res3.body.scores[0]).toHaveProperty("updated_at");
    });

    it("should update an existing score", async () => {
      const movement = {
        name: "Deadlift",
        measurement: "weight",
      };

      const res1: MovementResponse = await request.post("/movements", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          name: movement.name,
          measurement: movement.measurement,
        },
      });

      expect(res1.statusCode).toBe(StatusCodes.CREATED);
      expect(res1.body).toHaveProperty("movement_id");
      const movementId = res1.body.movement_id;
      expect(res1.body).toHaveProperty("name", movement.name);
      expect(res1.body).toHaveProperty("measurement", movement.measurement);
      expect(res1.body).toHaveProperty("created_at");
      expect(res1.body).toHaveProperty("updated_at");

      const res2: MovementResponse = await request.post(
        `/movements/${movementId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: {
            score: 200,
          },
        }
      );

      expect(res2.statusCode).toBe(StatusCodes.CREATED);
      expect(res2.body).toHaveProperty("movement_score_id");
      expect(res2.body).toHaveProperty("movement_id", movementId);
      expect(res2.body).toHaveProperty("score", 200);
      expect(res2.body).toHaveProperty("created_at");
      expect(res2.body).toHaveProperty("updated_at");

      const res3: MovementResponse = await request.get(
        `/movements/${movementId}`,
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
      expect(res3.body.scores[0]).toHaveProperty("movement_id");
      expect(res3.body.scores[0]).toHaveProperty("movement_score_id");
      expect(res3.body.scores[0]).toHaveProperty("score");
      expect(res3.body.scores[0]).toHaveProperty("created_at");
      expect(res3.body.scores[0]).toHaveProperty("updated_at");

      const movementScore = res3.body.scores[0];

      const res4: MovementScoreResponse = await request.patch(
        `/movements/${movementId}/${movementScore.movement_score_id}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: {
            score: 205,
            measurement: "weight",
            notes: "Jättebra!",
          },
        }
      );

      expect(res4.statusCode).toBe(StatusCodes.OK);
      expect(res4.body).toHaveProperty("movement_score_id");
      expect(res4.body).toHaveProperty("movement_id", movementId);
      expect(res4.body).toHaveProperty("score", 205);
      expect(res4.body).toHaveProperty("notes", "Jättebra!");
      expect(res4.body).toHaveProperty("created_at");
      expect(res4.body).toHaveProperty("updated_at");
      expect(res4.body.updated_at).not.toEqual(movementScore.updated_at);
    });

    it("should delete an existing score", async () => {
      const movement = {
        name: "Deadlift",
        measurement: "weight",
      };

      const res1: MovementResponse = await request.post("/movements", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          name: movement.name,
          measurement: movement.measurement,
        },
      });

      expect(res1.statusCode).toBe(StatusCodes.CREATED);
      expect(res1.body).toHaveProperty("movement_id");
      const movementId = res1.body.movement_id;
      expect(res1.body).toHaveProperty("name", movement.name);
      expect(res1.body).toHaveProperty("measurement", movement.measurement);
      expect(res1.body).toHaveProperty("created_at");
      expect(res1.body).toHaveProperty("updated_at");

      const res2: MovementResponse = await request.post(
        `/movements/${movementId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: {
            score: 200,
          },
        }
      );

      expect(res2.statusCode).toBe(StatusCodes.CREATED);
      expect(res2.body).toHaveProperty("movement_score_id");
      expect(res2.body).toHaveProperty("movement_id", movementId);
      expect(res2.body).toHaveProperty("score", 200);
      expect(res2.body).toHaveProperty("created_at");
      expect(res2.body).toHaveProperty("updated_at");

      const res3: MovementResponse = await request.get(
        `/movements/${movementId}`,
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
      expect(res3.body.scores[0]).toHaveProperty("movement_id");
      expect(res3.body.scores[0]).toHaveProperty("movement_score_id");
      expect(res3.body.scores[0]).toHaveProperty("score");
      expect(res3.body.scores[0]).toHaveProperty("created_at");
      expect(res3.body.scores[0]).toHaveProperty("updated_at");

      const movementScore = res3.body.scores[0];

      const res4: MovementScoreResponse = await request.delete(
        `/movements/${movementId}/${movementScore.movement_score_id}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res4.statusCode).toBe(StatusCodes.NO_CONTENT);

      const res5: MovementScoreResponse = await request.get(
        `/movements/${movementId}/${movementScore.movement_score_id}`,
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

  describe("user separated movements", () => {
    it("should not return movements created by other users", async () => {
      const movement = {
        name: "Bench press",
        measurement: "weight",
      };

      const res1: MovementResponse = await request.post("/movements", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          name: movement.name,
          measurement: movement.measurement,
        },
      });

      expect(res1.statusCode).toBe(StatusCodes.CREATED);
      expect(res1.body).toHaveProperty("movement_id");
      const movementId = res1.body.movement_id;
      expect(res1.body).toHaveProperty("name", movement.name);
      expect(res1.body).toHaveProperty("measurement", movement.measurement);
      expect(res1.body).toHaveProperty("created_at");
      expect(res1.body).toHaveProperty("updated_at");

      const res2: MovementResponse = await request.get(
        `/movements/${movementId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res2.statusCode).toBe(StatusCodes.OK);
      expect(res2.body).toHaveProperty("movement_id");
      expect(res2.body).toHaveProperty("name", movement.name);
      expect(res2.body).toHaveProperty("measurement", movement.measurement);
      expect(res2.body).toHaveProperty("created_at");
      expect(res2.body).toHaveProperty("updated_at");

      const res3 = await request.get(`/movements/${movementId}`, {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      expect(res3.statusCode).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe("public movements", () => {
    it("should return movements created by other users if they are marked as is_public", async () => {
      const movement = {
        name: "Snatch",
        measurement: "weight",
        is_public: true,
      };

      const res1: MovementResponse = await request.post("/movements", {
        ...reqOpts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: movement,
      });

      expect(res1.statusCode).toBe(StatusCodes.CREATED);
      expect(res1.body).toHaveProperty("movement_id");
      const movementId = res1.body.movement_id;
      expect(res1.body).toHaveProperty("name", movement.name);
      expect(res1.body).toHaveProperty("measurement", movement.measurement);
      expect(res1.body).toHaveProperty("is_public", true);
      expect(res1.body).toHaveProperty("created_at");
      expect(res1.body).toHaveProperty("updated_at");

      const res2: MovementResponse = await request.get(
        `/movements/${movementId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      expect(res2.statusCode).toBe(StatusCodes.OK);
      expect(res2.body).toHaveProperty("movement_id");
      expect(res2.body).toHaveProperty("name", movement.name);
      expect(res2.body).toHaveProperty("measurement", movement.measurement);
      expect(res2.body).toHaveProperty("is_public", true);
      expect(res2.body).toHaveProperty("created_at");
      expect(res2.body).toHaveProperty("updated_at");

      const res3: MovementResponse = await request.get(
        `/movements/${movementId}`,
        {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      expect(res3.statusCode).toBe(StatusCodes.OK);
      expect(res2.body).toHaveProperty("movement_id");
      expect(res2.body).toHaveProperty("name", movement.name);
      expect(res2.body).toHaveProperty("measurement", movement.measurement);
      expect(res2.body).toHaveProperty("is_public", true);
      expect(res2.body).toHaveProperty("created_at");
      expect(res2.body).toHaveProperty("updated_at");
    });
  });
});
