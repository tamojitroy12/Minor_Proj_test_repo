const request = require("supertest");
const app = require("../src/app");

describe("node-api", () => {
  it("health check should be healthy", async () => {
    const response = await request(app).get("/health");
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("divide should work", async () => {
    const response = await request(app).get("/divide?a=8&b=2");
    expect(response.statusCode).toBe(200);
    expect(response.body.result).toBe(4);
  });
});
