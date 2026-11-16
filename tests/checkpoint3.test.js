import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { store } from "../src/store/index.js";
import * as cloudinaryModule from "../src/lib/cloudinary.js";
import { publicReportSelect } from "../src/store/prisma.store.js";

describe("Checkpoint 3 Integration & Privacy Tests (T10 - T12)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("T10: File Upload with Cloudinary Stream", () => {
    it("should upload photo via stream and include photoUrl in report response", async () => {
      const mockCloudinaryResult = {
        secure_url: "https://res.cloudinary.com/pacil/image/upload/sample_photo.jpg",
        public_id: "lostfound/sample_photo_123",
      };

      vi.spyOn(cloudinaryModule, "uploadImageStream").mockResolvedValue(mockCloudinaryResult);

      const dummyImageBuffer = Buffer.from("dummy-jpeg-binary-data");

      const res = await request(app)
        .post("/reports")
        .attach("photo", dummyImageBuffer, {
          filename: "sample.jpg",
          contentType: "image/jpeg",
        })
        .field("type", "FOUND")
        .field("title", "Kunci Motor Vario Hitam")
        .field("description", "Ditemukan di dekat parkiran motor gedung B.")
        .field("categoryId", "7")
        .field("locationId", "9")
        .field("eventDate", "2026-11-15")
        .field("contactMethod", "WHATSAPP")
        .field("contactValue", "081234567890")
        .field("reporterName", "Bhre Nabil");

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("photoUrl");
      expect(res.body.data.photoUrl).toBe(mockCloudinaryResult.secure_url);
    });
  });

  describe("T11: Database Failure Rollback", () => {
    it("should delete uploaded image from Cloudinary when database creation fails", async () => {
      const mockCloudinaryResult = {
        secure_url: "https://res.cloudinary.com/pacil/image/upload/failed_db.jpg",
        public_id: "lostfound/failed_db_public_id",
      };

      vi.spyOn(cloudinaryModule, "uploadImageStream").mockResolvedValue(mockCloudinaryResult);
      const destroySpy = vi.spyOn(cloudinaryModule, "deleteImage").mockResolvedValue();
      vi.spyOn(store, "createReport").mockRejectedValue(new Error("Prisma connection error"));

      const dummyImageBuffer = Buffer.from("dummy-jpeg-binary-data");

      const res = await request(app)
        .post("/reports")
        .attach("photo", dummyImageBuffer, {
          filename: "sample.jpg",
          contentType: "image/jpeg",
        })
        .field("type", "FOUND")
        .field("title", "Dompet Kulit Cokelat")
        .field("description", "Ditemukan di lobi utama dekat lift.")
        .field("categoryId", "3")
        .field("locationId", "6")
        .field("eventDate", "2026-11-15")
        .field("contactMethod", "WHATSAPP")
        .field("contactValue", "081234567890");

      expect(res.status).toBe(500);
      expect(destroySpy).toHaveBeenCalledWith("lostfound/failed_db_public_id");
    });
  });

  describe("T12: Privacy & Projection Guarantee", () => {
    it("should never expose internal fields (photoPublicId, editTokenHash) in publicReportSelect", () => {
      expect(publicReportSelect).not.toHaveProperty("photoPublicId");
      expect(publicReportSelect).not.toHaveProperty("editTokenHash");
    });

    it("should ensure GET /reports and GET /reports/:id responses do not leak private fields", async () => {
      const listRes = await request(app).get("/reports");
      expect(listRes.status).toBe(200);

      listRes.body.data.forEach((item) => {
        expect(item).not.toHaveProperty("photoPublicId");
        expect(item).not.toHaveProperty("editTokenHash");
      });

      const singleRes = await request(app).get("/reports/6b1f6a52-3c1b-4a7e-9c55-0d6a1f2e8b01");
      expect(singleRes.status).toBe(200);
      expect(singleRes.body.data).not.toHaveProperty("photoPublicId");
      expect(singleRes.body.data).not.toHaveProperty("editTokenHash");
    });
  });
});
