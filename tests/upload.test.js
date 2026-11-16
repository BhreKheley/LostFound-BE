import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { uploadSinglePhoto } from "../src/middleware/upload.js";
import { errorHandler } from "../src/middleware/errorHandler.js";

describe("Upload Middleware (Multer)", () => {
  // Test app khusus untuk menguji middleware upload secara terisolasi
  const testApp = express();
  testApp.post(
    "/test-upload",
    uploadSinglePhoto,
    (req, res) => {
      res.status(200).json({
        fileReceived: !!req.file,
        mimetype: req.file?.mimetype || null,
        size: req.file?.size || 0,
      });
    },
    errorHandler
  );

  it("should accept valid PNG image upload", async () => {
    const dummyPngBuffer = Buffer.from("fake-png-content");
    const res = await request(testApp)
      .post("/test-upload")
      .attach("photo", dummyPngBuffer, {
        filename: "test.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(200);
    expect(res.body.fileReceived).toBe(true);
    expect(res.body.mimetype).toBe("image/png");
  });

  it("should succeed when photo is omitted (optional photo)", async () => {
    const res = await request(testApp).post("/test-upload");

    expect(res.status).toBe(200);
    expect(res.body.fileReceived).toBe(false);
  });

  it("should reject file with unsupported mime-type (T6)", async () => {
    const dummyTxtBuffer = Buffer.from("plain text content");
    const res = await request(testApp)
      .post("/test-upload")
      .attach("photo", dummyTxtBuffer, {
        filename: "notes.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(415);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
    expect(res.body.error.message).toContain("JPEG, PNG, atau WebP");
  });

  it("should reject file exceeding 5MB size limit (T5)", async () => {
    // 5MB + 1KB buffer
    const oversizedBuffer = Buffer.alloc(5 * 1024 * 1024 + 1024);
    const res = await request(testApp)
      .post("/test-upload")
      .attach("photo", oversizedBuffer, {
        filename: "large.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(413);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error.code).toBe("PAYLOAD_TOO_LARGE");
    expect(res.body.error.message).toContain("5 MB");
  });
});
