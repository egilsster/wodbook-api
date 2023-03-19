const baseUrl = process.env.API_URL || "http://127.0.0.1:43210";

describe("Open endpoints", () => {
  it("/health should return 200 OK", async () => {
    const res = await fetch(`${baseUrl}/health`, { method: "get" });
    expect(res.status).toBe(200);
  });

  it("/openapi should return 200 OK", async () => {
    const res = await fetch(`${baseUrl}/openapi`, { method: "get" });
    expect(res.status).toBe(200);
  });
});
