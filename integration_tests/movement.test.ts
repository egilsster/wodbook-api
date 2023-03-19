import { MongoClient, Db } from "mongodb";
import { StatusCodes } from "http-status-codes";
import { createUsers, getMongoClient } from "./common";
import { LoginData, LoginPayload } from "./types/user";
import {
  ManyMovementsData,
  MovementData,
  MovementScoreData,
} from "./types/movement";

const baseUrl = `${process.env.API_URL || "http://127.0.0.1:43210"}/v1`;

describe("/v1/movements", () => {
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
    await db.collection("movements").deleteMany({});
    await db.collection("movementscores").deleteMany({});
  });

  afterAll(async () => {
    await mongoClient.close();
  });

  describe("listing movements", () => {
    it("should return 200 OK with a list", async () => {
      const res1 = await fetch(`${baseUrl}/movements`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body1: ManyMovementsData = await res1.json();

      expect(res1.status).toBe(StatusCodes.OK);
      expect(body1).toHaveProperty("data");
      const movements = body1.data;
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
      const res0 = await fetch(`${baseUrl}/movements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(placeholder_movement),
      });
      expect(res0.status).toBe(StatusCodes.CREATED);

      const res1 = await fetch(`${baseUrl}/movements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          name: movement.name,
          measurement: movement.measurement,
        }),
      });
      const body1: MovementData = await res1.json();

      expect(res1.status).toBe(StatusCodes.CREATED);
      expect(body1).toHaveProperty("movement_id");
      const movementId = body1.movement_id;
      expect(body1).toHaveProperty("created_at");
      expect(body1).toHaveProperty("updated_at");
      expect(body1).toHaveProperty("measurement", movement.measurement);
      expect(body1).toHaveProperty("name", movement.name);

      const res2 = await fetch(`${baseUrl}/movements/${movementId}`, {
        method: "GET",
        headers: {
          // "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      expect(res2.status).toBe(StatusCodes.OK);
      const body2: MovementData = await res2.json();
      expect(body2).toHaveProperty("movement_id");
      expect(body2).toHaveProperty("created_at");
      expect(body2).toHaveProperty("updated_at");
      expect(body2).toHaveProperty("measurement", movement.measurement);
      expect(body2).toHaveProperty("name", movement.name);

      const res3 = await fetch(`${baseUrl}/movements`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      expect(res3.status).toBe(StatusCodes.OK);
      const body3 = await res3.json();
      expect(body3).toHaveProperty("data");
      const movements = body3.data;
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
      const res1 = await fetch(`${baseUrl}/movements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(movement),
      });
      const body1 = await res1.json();

      expect(res1.status).toBe(StatusCodes.CREATED);
      expect(body1).toHaveProperty("movement_id");
      expect(body1).toHaveProperty("created_at");
      expect(body1).toHaveProperty("updated_at");
      expect(body1).toHaveProperty("measurement", movement.measurement);
      expect(body1).toHaveProperty("name", movement.name);

      const res2 = await fetch(`${baseUrl}/movements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(movement),
      });
      expect(res2.status).toBe(StatusCodes.CONFLICT);
    });

    it("should get 422 Unprocessable Entity if an invalid measurement", async () => {
      const res = await fetch(`${baseUrl}/movements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          name: "my-movement",
          measurement: "invalid-measure",
        }),
      });

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    });
  });

  describe("updating movements", () => {
    it("should be able to movement name", async () => {
      const movement = {
        name: "Sholder Press",
        measurement: "weight",
      };

      const res1 = await fetch(`${baseUrl}/movements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(movement),
      });
      const body1: MovementData = await res1.json();

      expect(res1.status).toBe(StatusCodes.CREATED);
      expect(body1).toHaveProperty("movement_id");
      const movementId = body1.movement_id;
      expect(body1).toHaveProperty("name", movement.name);
      expect(body1).toHaveProperty("measurement", movement.measurement);
      expect(body1).toHaveProperty("is_public", false);
      expect(body1).toHaveProperty("created_at");
      expect(body1).toHaveProperty("updated_at");

      const res2 = await fetch(`${baseUrl}/movements/${movementId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body2: MovementData = await res2.json();

      expect(res2.status).toBe(StatusCodes.OK);
      expect(body2).toHaveProperty("movement_id");
      expect(body2).toHaveProperty("name", movement.name);
      expect(body2).toHaveProperty("measurement", movement.measurement);
      expect(body2).toHaveProperty("is_public", false);
      expect(body2).toHaveProperty("created_at");
      expect(body2).toHaveProperty("updated_at");
      expect(body2.created_at).toEqual(body2.updated_at);

      const res3 = await fetch(`${baseUrl}/movements/${movementId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          name: "Shoulder Press",
        }),
      });
      const body3: MovementData = await res3.json();

      expect(res3.status).toBe(StatusCodes.OK);
      expect(body3).toHaveProperty("movement_id");
      expect(body3).toHaveProperty("name", "Shoulder Press");
      expect(body3).toHaveProperty("measurement", movement.measurement);
      expect(body3).toHaveProperty("is_public", false);
      expect(body3).toHaveProperty("created_at");
      expect(body3).toHaveProperty("updated_at");
      expect(body3.created_at).not.toEqual(body3.updated_at);

      const res4 = await fetch(`${baseUrl}/movements/${movementId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body4: MovementData = await res4.json();

      expect(res4.status).toBe(StatusCodes.OK);
      expect(body4).toHaveProperty("movement_id");
      expect(body4).toHaveProperty("name", "Shoulder Press");
      expect(body4).toHaveProperty("measurement", movement.measurement);
      expect(body4).toHaveProperty("is_public", false);
      expect(body4).toHaveProperty("created_at");
      expect(body4).toHaveProperty("updated_at");
      expect(body4.created_at).not.toEqual(body4.updated_at);
    });

    it("should get 409 Conflict if you set to a name that already exists", async () => {
      const movement = {
        name: "Shoulder Press",
        measurement: "weight",
      };

      const res1 = await fetch(`${baseUrl}/movements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          name: "Sholder Press",
          measurement: "weight",
        }),
      });
      const body1: MovementData = await res1.json();

      expect(res1.status).toBe(StatusCodes.CREATED);
      expect(body1).toHaveProperty("movement_id");
      const movementId = body1.movement_id;
      expect(body1).toHaveProperty("name", "Sholder Press");

      const res2 = await fetch(`${baseUrl}/movements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(movement),
      });
      const body2: MovementData = await res2.json();

      expect(res2.status).toBe(StatusCodes.CREATED);
      expect(body2).toHaveProperty("name", "Shoulder Press");

      const res3 = await fetch(`${baseUrl}/movements/${movementId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          name: "Shoulder Press",
        }),
      });

      expect(res3.status).toBe(StatusCodes.CONFLICT);

      const res4 = await fetch(`${baseUrl}/movements/${movementId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body4: MovementData = await res4.json();

      expect(res4.status).toBe(StatusCodes.OK);
      expect(body4).toHaveProperty("name", "Sholder Press");
    });
  });

  describe("deleting movements", () => {
    it("should delete a movement and its scores", async () => {
      const movement = {
        name: "Snatch",
        measurement: "weight",
      };

      const res1 = await fetch(`${baseUrl}/movements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(movement),
      });
      const body1: MovementData = await res1.json();

      expect(res1.status).toBe(StatusCodes.CREATED);
      expect(body1).toHaveProperty("movement_id");
      const movementId = body1.movement_id;

      const res2 = await fetch(`${baseUrl}/movements/${movementId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          score: 100,
        }),
      });
      const body2: MovementScoreData = await res2.json();

      expect(res2.status).toBe(StatusCodes.CREATED);
      const movementScoreId = body2.movement_score_id;

      const res3 = await fetch(`${baseUrl}/movements/${movementId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      expect(res3.status).toBe(StatusCodes.OK);

      const res4 = await fetch(`${baseUrl}/movements/${movementId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      expect(res4.status).toBe(StatusCodes.NO_CONTENT);

      const res5 = await fetch(`${baseUrl}/movements/${movementId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      expect(res5.status).toBe(StatusCodes.NOT_FOUND);

      const res6 = await fetch(
        `${baseUrl}/movements/${movementId}/${movementScoreId}`,
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

  describe("movement scores", () => {
    it("should create a new movement and add a score for it", async () => {
      const movement = {
        name: "Deadlift",
        measurement: "weight",
      };

      const res1 = await fetch(`${baseUrl}/movements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          name: movement.name,
          measurement: movement.measurement,
        }),
      });
      const body1: MovementData = await res1.json();

      expect(res1.status).toBe(StatusCodes.CREATED);
      expect(body1).toHaveProperty("movement_id");
      const movementId = body1.movement_id;
      expect(body1).toHaveProperty("name", movement.name);
      expect(body1).toHaveProperty("measurement", movement.measurement);
      expect(body1).toHaveProperty("created_at");
      expect(body1).toHaveProperty("updated_at");

      const res2 = await fetch(`${baseUrl}/movements/${movementId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          score: 200,
          measurement: "weight",
        }),
      });
      const body2: MovementData = await res2.json();

      expect(res2.status).toBe(StatusCodes.CREATED);
      expect(body2).toHaveProperty("movement_score_id");
      expect(body2).toHaveProperty("movement_id", movementId);
      expect(body2).toHaveProperty("score", 200);
      expect(body2).toHaveProperty("created_at");
      expect(body2).toHaveProperty("updated_at");

      const res3 = await fetch(`${baseUrl}/movements/${movementId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body3: MovementData = await res3.json();

      expect(res3.status).toBe(StatusCodes.OK);
      expect(body3).toHaveProperty("scores");
      expect(body3.scores[0]).toHaveProperty("movement_id");
      expect(body3.scores[0]).toHaveProperty("movement_score_id");
      expect(body3.scores[0]).toHaveProperty("score");
      expect(body3.scores[0]).toHaveProperty("created_at");
      expect(body3.scores[0]).toHaveProperty("updated_at");
    });

    it("should update an existing score", async () => {
      const movement = {
        name: "Deadlift",
        measurement: "weight",
      };

      const res1 = await fetch(`${baseUrl}/movements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(movement),
      });
      const body1: MovementData = await res1.json();

      expect(res1.status).toBe(StatusCodes.CREATED);
      expect(body1).toHaveProperty("movement_id");
      const movementId = body1.movement_id;
      expect(body1).toHaveProperty("name", movement.name);
      expect(body1).toHaveProperty("measurement", movement.measurement);
      expect(body1).toHaveProperty("created_at");
      expect(body1).toHaveProperty("updated_at");

      const res2 = await fetch(`${baseUrl}/movements/${movementId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          score: 200,
        }),
      });
      const body2: MovementData = await res2.json();

      expect(res2.status).toBe(StatusCodes.CREATED);
      expect(body2).toHaveProperty("movement_score_id");
      expect(body2).toHaveProperty("movement_id", movementId);
      expect(body2).toHaveProperty("score", 200);
      expect(body2).toHaveProperty("created_at");
      expect(body2).toHaveProperty("updated_at");

      const res3 = await fetch(`${baseUrl}/movements/${movementId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body3: MovementData = await res3.json();

      expect(res3.status).toBe(StatusCodes.OK);
      expect(body3).toHaveProperty("scores");
      expect(body3.scores[0]).toHaveProperty("movement_id");
      expect(body3.scores[0]).toHaveProperty("movement_score_id");
      expect(body3.scores[0]).toHaveProperty("score");
      expect(body3.scores[0]).toHaveProperty("created_at");
      expect(body3.scores[0]).toHaveProperty("updated_at");

      const movementScore = body3.scores[0];

      const res4 = await fetch(
        `${baseUrl}/movements/${movementId}/${movementScore.movement_score_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            score: 205,
            measurement: "weight",
            notes: "Jättebra!",
          }),
        }
      );
      const body4: MovementData = await res4.json();

      expect(res4.status).toBe(StatusCodes.OK);
      expect(body4).toHaveProperty("movement_score_id");
      expect(body4).toHaveProperty("movement_id", movementId);
      expect(body4).toHaveProperty("score", 205);
      expect(body4).toHaveProperty("notes", "Jättebra!");
      expect(body4).toHaveProperty("created_at");
      expect(body4).toHaveProperty("updated_at");
      expect(body4.updated_at).not.toEqual(movementScore.updated_at);
    });

    it("should delete an existing score", async () => {
      const movement = {
        name: "Deadlift",
        measurement: "weight",
      };

      const res1 = await fetch(`${baseUrl}/movements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          name: movement.name,
          measurement: movement.measurement,
        }),
      });
      const body1: MovementData = await res1.json();

      expect(res1.status).toBe(StatusCodes.CREATED);
      expect(body1).toHaveProperty("movement_id");
      const movementId = body1.movement_id;
      expect(body1).toHaveProperty("name", movement.name);
      expect(body1).toHaveProperty("measurement", movement.measurement);
      expect(body1).toHaveProperty("created_at");
      expect(body1).toHaveProperty("updated_at");

      const res2 = await fetch(`${baseUrl}/movements/${movementId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          score: 200,
        }),
      });
      const body2: MovementData = await res2.json();

      expect(res2.status).toBe(StatusCodes.CREATED);
      expect(body2).toHaveProperty("movement_score_id");
      expect(body2).toHaveProperty("movement_id", movementId);
      expect(body2).toHaveProperty("score", 200);
      expect(body2).toHaveProperty("created_at");
      expect(body2).toHaveProperty("updated_at");

      const res3 = await fetch(`${baseUrl}/movements/${movementId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body3: MovementData = await res3.json();

      expect(res3.status).toBe(StatusCodes.OK);
      expect(body3).toHaveProperty("scores");
      expect(body3.scores[0]).toHaveProperty("movement_id");
      expect(body3.scores[0]).toHaveProperty("movement_score_id");
      expect(body3.scores[0]).toHaveProperty("score");
      expect(body3.scores[0]).toHaveProperty("created_at");
      expect(body3.scores[0]).toHaveProperty("updated_at");

      const movementScore = body3.scores[0];

      const res4 = await fetch(
        `${baseUrl}/movements/${movementId}/${movementScore.movement_score_id}`,
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
        `${baseUrl}/movements/${movementId}/${movementScore.movement_score_id}`,
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

  describe("user separated movements", () => {
    it("should not return movements created by other users", async () => {
      const movement = {
        name: "Bench press",
        measurement: "weight",
      };

      const res1 = await fetch(`${baseUrl}/movements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          name: movement.name,
          measurement: movement.measurement,
        }),
      });
      const body1: MovementData = await res1.json();

      expect(res1.status).toBe(StatusCodes.CREATED);
      expect(body1).toHaveProperty("movement_id");
      const movementId = body1.movement_id;
      expect(body1).toHaveProperty("name", movement.name);
      expect(body1).toHaveProperty("measurement", movement.measurement);
      expect(body1).toHaveProperty("created_at");
      expect(body1).toHaveProperty("updated_at");

      const res2 = await fetch(`${baseUrl}/movements/${movementId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body2: MovementData = await res2.json();

      expect(res2.status).toBe(StatusCodes.OK);
      expect(body2).toHaveProperty("movement_id");
      expect(body2).toHaveProperty("name", movement.name);
      expect(body2).toHaveProperty("measurement", movement.measurement);
      expect(body2).toHaveProperty("created_at");
      expect(body2).toHaveProperty("updated_at");

      const res3 = await fetch(`${baseUrl}/movements/${movementId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      expect(res3.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe("public movements", () => {
    it("should return movements created by other users if they are marked as is_public", async () => {
      const movement = {
        name: "Snatch",
        measurement: "weight",
        is_public: true,
      };

      const res1 = await fetch(`${baseUrl}/movements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(movement),
      });
      const body1: MovementData = await res1.json();

      expect(res1.status).toBe(StatusCodes.CREATED);
      expect(body1).toHaveProperty("movement_id");
      const movementId = body1.movement_id;
      expect(body1).toHaveProperty("name", movement.name);
      expect(body1).toHaveProperty("measurement", movement.measurement);
      expect(body1).toHaveProperty("is_public", true);
      expect(body1).toHaveProperty("created_at");
      expect(body1).toHaveProperty("updated_at");

      const res2 = await fetch(`${baseUrl}/movements/${movementId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const body2: MovementData = await res2.json();

      expect(res2.status).toBe(StatusCodes.OK);
      expect(body2).toHaveProperty("movement_id");
      expect(body2).toHaveProperty("name", movement.name);
      expect(body2).toHaveProperty("measurement", movement.measurement);
      expect(body2).toHaveProperty("is_public", true);
      expect(body2).toHaveProperty("created_at");
      expect(body2).toHaveProperty("updated_at");

      const res3 = await fetch(`${baseUrl}/movements/${movementId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      expect(res3.status).toBe(StatusCodes.OK);
      expect(body2).toHaveProperty("movement_id");
      expect(body2).toHaveProperty("name", movement.name);
      expect(body2).toHaveProperty("measurement", movement.measurement);
      expect(body2).toHaveProperty("is_public", true);
      expect(body2).toHaveProperty("created_at");
      expect(body2).toHaveProperty("updated_at");
    });
  });
});
