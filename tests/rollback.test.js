import { describe, it, expect, vi, beforeEach } from "vitest";
import { createReportService } from "../src/services/reports.service.js";
import { store } from "../src/store/index.js";
import * as cloudinaryModule from "../src/lib/cloudinary.js";

describe("Upload Rollback Mechanism (T11)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should rollback and delete uploaded image from Cloudinary if store insertion fails (T11)", async () => {
    const mockUploadResult = {
      secure_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      public_id: "lostfound/sample_orphan_file",
    };

    // Mock uploadImageStream berhasil
    vi.spyOn(cloudinaryModule, "uploadImageStream").mockResolvedValue(mockUploadResult);

    // Mock deleteImage untuk memverifikasi pembersihan rollback
    const deleteSpy = vi.spyOn(cloudinaryModule, "deleteImage").mockResolvedValue();

    // Mock store.createReport melempar error (misal DB crash / connection timeout)
    vi.spyOn(store, "createReport").mockRejectedValue(new Error("Database connection lost"));

    const fakeFile = {
      buffer: Buffer.from("image content"),
      mimetype: "image/jpeg",
    };

    const dummyReportData = {
      type: "LOST",
      title: "Barang Uji",
      categoryId: 1,
      locationId: 1,
      eventDate: "2026-11-15",
      contactMethod: "WHATSAPP",
      contactValue: "6281234567890",
    };

    await expect(createReportService(dummyReportData, fakeFile)).rejects.toThrow(
      "Database connection lost"
    );

    // Pastikan rollback dijalankan: deleteImage dipanggil dengan public_id yang sama
    expect(deleteSpy).toHaveBeenCalledWith("lostfound/sample_orphan_file");
  });

  it("should not call deleteImage if store insertion succeeds", async () => {
    const mockUploadResult = {
      secure_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      public_id: "lostfound/sample_success",
    };

    vi.spyOn(cloudinaryModule, "uploadImageStream").mockResolvedValue(mockUploadResult);
    const deleteSpy = vi.spyOn(cloudinaryModule, "deleteImage").mockResolvedValue();
    vi.spyOn(store, "createReport").mockResolvedValue({ id: "success-id" });

    const fakeFile = {
      buffer: Buffer.from("image content"),
      mimetype: "image/jpeg",
    };

    await createReportService({}, fakeFile);

    expect(deleteSpy).not.toHaveBeenCalled();
  });
});
