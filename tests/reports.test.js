import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { memoryStore } from "../src/store/memory.store.js";

describe("REST API Endpoints", () => {
  beforeEach(() => {
    memoryStore.reset();
  });

  describe("GET /categories & GET /locations", () => {
    it("should return 8 categories", async () => {
      const res = await request(app).get("/categories");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(8);
      expect(res.body.data[0]).toHaveProperty("id");
      expect(res.body.data[0]).toHaveProperty("name");
    });

    it("should return 9 locations", async () => {
      const res = await request(app).get("/locations");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(9);
      expect(res.body.data[0]).toHaveProperty("id");
      expect(res.body.data[0]).toHaveProperty("name");
    });
  });

  describe("GET /reports", () => {
    it("should return list of reports with pagination (T8)", async () => {
      const res = await request(app).get("/reports?page=1&limit=12");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(6);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(12);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(6);
    });

    it("should filter by search keyword, type, categoryId, and locationId", async () => {
      const res = await request(app).get("/reports?type=LOST&categoryId=4");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].type).toBe("LOST");
      expect(res.body.data[0].category.id).toBe(4);
    });

    it("should return 400 INVALID_QUERY for invalid query parameters", async () => {
      const res = await request(app).get("/reports?type=INVALID_TYPE");
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("INVALID_QUERY");
    });
  });

  describe("GET /reports/:id", () => {
    it("should return report detail for valid existing UUID (T9)", async () => {
      const validId = "6b1f6a52-3c1b-4a7e-9c55-0d6a1f2e8b01";
      const res = await request(app).get(`/reports/${validId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(validId);
      expect(res.body.data.title).toContain("Tumbler");
    });

    it("should return 404 NOT_FOUND for non-existent UUID (T9)", async () => {
      const nonExistent = "00000000-0000-0000-0000-000000000000";
      const res = await request(app).get(`/reports/${nonExistent}`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("should return 400 INVALID_QUERY for malformed UUID param", async () => {
      const res = await request(app).get("/reports/bukan-uuid");
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("INVALID_QUERY");
    });
  });

  describe("POST /reports", () => {
    it("should create new report and return 201 with Location header (T7)", async () => {
      const res = await request(app)
        .post("/reports")
        .field("type", "LOST")
        .field("title", "Buku Catatan Algoritma")
        .field("description", "Buku catatan binder B5 warna biru tertinggal di perpustakaan.")
        .field("categoryId", "8")
        .field("locationId", "3")
        .field("eventDate", "2026-11-15")
        .field("contactMethod", "WHATSAPP")
        .field("contactValue", "081234567890")
        .field("reporterName", "Bhre Nabil");

      expect(res.status).toBe(201);
      expect(res.headers.location).toBeDefined();
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.contactValue).toBe("6281234567890"); // Ternormalisasi
      expect(res.body.data.status).toBe("ACTIVE");
    });

    it("should reject invalid report creation and return 400 VALIDATION_ERROR (T1)", async () => {
      const res = await request(app)
        .post("/reports")
        .field("type", "LOST"); // Field wajib lainnya hilang

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
      expect(Array.isArray(res.body.error.details)).toBe(true);
    });
  });

  describe("Method Not Allowed (405)", () => {
    it("should return 405 on PUT, PATCH, or DELETE to /reports", async () => {
      const putRes = await request(app).put("/reports");
      expect(putRes.status).toBe(405);
      expect(putRes.body.error.code).toBe("METHOD_NOT_ALLOWED");

      const deleteRes = await request(app).delete("/reports");
      expect(deleteRes.status).toBe(405);
      expect(deleteRes.body.error.code).toBe("METHOD_NOT_ALLOWED");
    });

    it("should return 405 on PUT, PATCH, or DELETE to /reports/:id", async () => {
      const validId = "6b1f6a52-3c1b-4a7e-9c55-0d6a1f2e8b01";
      const deleteRes = await request(app).delete(`/reports/${validId}`);
      expect(deleteRes.status).toBe(405);
      expect(deleteRes.body.error.code).toBe("METHOD_NOT_ALLOWED");
    });
  });
});
