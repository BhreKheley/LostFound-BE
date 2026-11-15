import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("GET /health", () => {
  it("should return status 200 with status 'ok' and valid timestamp", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("timestamp");

    const parsedDate = new Date(res.body.timestamp);
    expect(parsedDate.getTime()).not.toBeNaN();
  });
});
