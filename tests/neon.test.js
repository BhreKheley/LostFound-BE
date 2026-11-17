import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { getRealtimeConfig, sealActiveReportsQuery } from "../src/lib/realtime.js";

describe("Neon Cloud Services Integration (Postgres & Realtime)", () => {
  it("should query categories from Neon PostgreSQL database", async () => {
    const categories = await prisma.category.findMany({
      orderBy: { id: "asc" },
    });

    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBe(8);
    expect(categories[0]).toHaveProperty("name", "KTM dan kartu identitas");
  });

  it("should query locations from Neon PostgreSQL database", async () => {
    const locations = await prisma.location.findMany({
      orderBy: { id: "asc" },
    });

    expect(Array.isArray(locations)).toBe(true);
    expect(locations.length).toBe(9);
    expect(locations[0]).toHaveProperty("name", "Ruang kelas");
  });

  it("should generate a valid sealed query using Neon Realtime secret", async () => {
    const sealedQuery = await sealActiveReportsQuery();
    expect(sealedQuery).toBeDefined();
    expect(typeof sealedQuery).toBe("object");
    expect(sealedQuery).toHaveProperty("capability");
    expect(sealedQuery).toHaveProperty("queryFingerprint");
    expect(sealedQuery).toHaveProperty("expiresAt");
  });

  it("should return Realtime configuration and sealed query via GET /api/realtime/reports", async () => {
    const res = await request(app).get("/api/realtime/reports");
    expect(res.status).toBe(200);
    expect(res.body.enabled).toBe(true);
    expect(res.body.url).toMatch(/^wss:\/\//);
    expect(res.body.branch).toBe("production");
    expect(res.body.sealedQuery).toBeDefined();
    expect(res.body.sealedQuery).toHaveProperty("capability");
    expect(res.body.sealedQuery).toHaveProperty("queryFingerprint");
    expect(res.body.sealedQuery).toHaveProperty("expiresAt");
  });
});
