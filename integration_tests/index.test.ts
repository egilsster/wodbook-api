import * as request from "request-promise-native";

const baseUrl = process.env.API_URL || "http://127.0.0.1:43210";

describe("Open endpoints", () => {
  const reqOpts: request.RequestPromiseOptions = {
    resolveWithFullResponse: true,
    baseUrl: baseUrl,
  };

  it("/health should return 200 OK", async () => {
    const res = await request.get("/health", reqOpts);
    expect(res.statusCode).toBe(200);
  });

  it("/openapi should return 200 OK", async () => {
    const res = await request.get("/openapi", reqOpts);
    expect(res.statusCode).toBe(200);
  });
});
