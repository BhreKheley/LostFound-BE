import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Error Handling Middleware", () => {
  it("should return 404 for unknown routes in uniform error format", async () => {
    const res = await request(app).get("/api/unknown-endpoint");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toHaveProperty("code", "NOT_FOUND");
    expect(res.body.error).toHaveProperty("message");
    expect(res.body.error.message).toContain("tidak ditemukan");
  });
});
