import { MongoClient, Db } from "mongodb";
import * as request from "request-promise-native";
import * as HttpStatus from "http-status-codes";
import { createUsers, getMongoClient } from "./common";

describe("/v1/movements/", () => {
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
    const res1: LoginResponse = await request.post("users/login", {
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

  afterEach(async () => {
    await db.collection("movements").deleteMany({});
    await db.collection("movementscores").deleteMany({});
  });

  afterAll(async () => {
    await mongoClient.close();
  });

  describe("listing movements", () => {
    it("should return 200 OK with a list", async (done) => {
      try {
        const res1: ManyMovementsResponse = await request.get("/movements/", {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        });

        expect(res1.statusCode).toBe(HttpStatus.OK);
        expect(res1.body).toHaveProperty("data");
        const movements = res1.body.data;
        expect(movements).toHaveProperty("length", 0);
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  describe("creating movements", () => {
    it("should create a new movement. This should return Created (201)", async (done) => {
      const movement = {
        name: "Snatch",
        measurement: "weight",
      };

      try {
        const res1: MovementResponse = await request.post("/movements/", {
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

        expect(res1.statusCode).toBe(HttpStatus.CREATED);
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

        expect(res2.statusCode).toBe(HttpStatus.OK);
        expect(res2.body).toHaveProperty("movement_id");
        expect(res2.body).toHaveProperty("created_at");
        expect(res2.body).toHaveProperty("updated_at");
        expect(res2.body).toHaveProperty("measurement", movement.measurement);
        expect(res2.body).toHaveProperty("name", movement.name);

        done();
      } catch (err) {
        done(err);
      }
    });

    it("should get 409 Conflict if creating the same movement more than once", async (done) => {
      const movement = {
        name: "Thruster",
        measurement: "weight",
      };

      try {
        const payload = {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: movement,
        };

        const res1: MovementResponse = await request.post(
          "/movements/",
          payload
        );

        expect(res1.statusCode).toBe(HttpStatus.CREATED);
        expect(res1.body).toHaveProperty("movement_id");
        expect(res1.body).toHaveProperty("created_at");
        expect(res1.body).toHaveProperty("updated_at");
        expect(res1.body).toHaveProperty("measurement", movement.measurement);
        expect(res1.body).toHaveProperty("name", movement.name);

        const res2: MovementResponse = await request.post(
          "/movements/",
          payload
        );

        expect(res2.statusCode).toBe(HttpStatus.CONFLICT);
        done();
      } catch (err) {
        done(err);
      }
    });

    it("should get 422 Unprocessable Entity if an invalid measurement", async (done) => {
      try {
        const res: MovementResponse = await request.post("/movements/", {
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

        expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  describe("updating movements", () => {
    it("should be able to movement name", async (done) => {
      const movement = {
        name: "Sholder Press",
        measurement: "weight",
      };

      try {
        const res1: MovementResponse = await request.post("/movements/", {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: movement,
        });

        expect(res1.statusCode).toBe(HttpStatus.CREATED);
        expect(res1.body).toHaveProperty("movement_id");
        const movementId = res1.body.movement_id;
        expect(res1.body).toHaveProperty("name", movement.name);
        expect(res1.body).toHaveProperty("measurement", movement.measurement);
        expect(res1.body).toHaveProperty("global", false);
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

        expect(res2.statusCode).toBe(HttpStatus.OK);
        expect(res2.body).toHaveProperty("movement_id");
        expect(res2.body).toHaveProperty("name", movement.name);
        expect(res2.body).toHaveProperty("measurement", movement.measurement);
        expect(res2.body).toHaveProperty("global", false);
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

        expect(res3.statusCode).toBe(HttpStatus.OK);
        expect(res3.body).toHaveProperty("movement_id");
        expect(res3.body).toHaveProperty("name", "Shoulder Press");
        expect(res3.body).toHaveProperty("measurement", movement.measurement);
        expect(res3.body).toHaveProperty("global", false);
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

        expect(res4.statusCode).toBe(HttpStatus.OK);
        expect(res4.body).toHaveProperty("movement_id");
        expect(res4.body).toHaveProperty("name", "Shoulder Press");
        expect(res4.body).toHaveProperty("measurement", movement.measurement);
        expect(res4.body).toHaveProperty("global", false);
        expect(res4.body).toHaveProperty("created_at");
        expect(res4.body).toHaveProperty("updated_at");
        expect(res4.body.created_at).not.toEqual(res4.body.updated_at);

        done();
      } catch (err) {
        done(err);
      }
    });

    it("should get 409 Conflict if you set to a name that already exists", async (done) => {
      const movement = {
        name: "Shoulder Press",
        measurement: "weight",
      };

      try {
        const res1: MovementResponse = await request.post("/movements/", {
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

        expect(res1.statusCode).toBe(HttpStatus.CREATED);
        expect(res1.body).toHaveProperty("movement_id");
        const movementId = res1.body.movement_id;
        expect(res1.body).toHaveProperty("name", "Sholder Press");

        const res2: MovementResponse = await request.post("/movements/", {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: movement,
        });

        expect(res2.statusCode).toBe(HttpStatus.CREATED);
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

        expect(res3.statusCode).toBe(HttpStatus.CONFLICT);

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

        expect(res4.statusCode).toBe(HttpStatus.OK);
        expect(res4.body).toHaveProperty("name", "Sholder Press");

        done();
      } catch (err) {
        done(err);
      }
    });
  });

  describe("movement scores", () => {
    it("should create a new movement and add a score for it", async (done) => {
      const movement = {
        name: "Deadlift",
        measurement: "weight",
      };

      try {
        const res1: MovementResponse = await request.post("/movements/", {
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

        expect(res1.statusCode).toBe(HttpStatus.CREATED);
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
              score: "200kg",
              measurement: "weight",
            },
          }
        );

        expect(res2.statusCode).toBe(HttpStatus.CREATED);
        expect(res2.body).toHaveProperty("movement_score_id");
        expect(res2.body).toHaveProperty("movement_id", movementId);
        expect(res2.body).toHaveProperty("score", "200kg");
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

        expect(res3.statusCode).toBe(HttpStatus.OK);
        expect(res3.body).toHaveProperty("scores");
        expect(res3.body.scores[0]).toHaveProperty("movement_id");
        expect(res3.body.scores[0]).toHaveProperty("movement_score_id");
        expect(res3.body.scores[0]).toHaveProperty("score");
        expect(res3.body.scores[0]).toHaveProperty("created_at");
        expect(res3.body.scores[0]).toHaveProperty("updated_at");
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  describe("user separated movements", () => {
    it("should not return movements created by other users", async (done) => {
      const movement = {
        name: "Bench press",
        measurement: "weight",
      };

      try {
        const res1: MovementResponse = await request.post("/movements/", {
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

        expect(res1.statusCode).toBe(HttpStatus.CREATED);
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

        expect(res2.statusCode).toBe(HttpStatus.OK);
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

        expect(res3.statusCode).toBe(HttpStatus.NOT_FOUND);

        done();
      } catch (err) {
        done(err);
      }
    });
  });

  describe("global movements", () => {
    it("should return movements created by other users if they are marked as global", async (done) => {
      const movement = {
        name: "Snatch",
        measurement: "weight",
        global: true,
      };

      try {
        const res1: MovementResponse = await request.post("/movements/", {
          ...reqOpts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: movement,
        });

        expect(res1.statusCode).toBe(HttpStatus.CREATED);
        expect(res1.body).toHaveProperty("movement_id");
        const movementId = res1.body.movement_id;
        expect(res1.body).toHaveProperty("name", movement.name);
        expect(res1.body).toHaveProperty("measurement", movement.measurement);
        expect(res1.body).toHaveProperty("global", true);
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

        expect(res2.statusCode).toBe(HttpStatus.OK);
        expect(res2.body).toHaveProperty("movement_id");
        expect(res2.body).toHaveProperty("name", movement.name);
        expect(res2.body).toHaveProperty("measurement", movement.measurement);
        expect(res2.body).toHaveProperty("global", true);
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

        expect(res3.statusCode).toBe(HttpStatus.OK);
        expect(res2.body).toHaveProperty("movement_id");
        expect(res2.body).toHaveProperty("name", movement.name);
        expect(res2.body).toHaveProperty("measurement", movement.measurement);
        expect(res2.body).toHaveProperty("global", true);
        expect(res2.body).toHaveProperty("created_at");
        expect(res2.body).toHaveProperty("updated_at");

        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
