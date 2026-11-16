import { describe, it, expect, vi } from "vitest";
import { cloudinary, uploadImageStream, deleteImage } from "../src/lib/cloudinary.js";
import { AppError } from "../src/lib/AppError.js";

describe("Cloudinary Integration Helper", () => {
  it("should successfully upload image via stream and return secure_url and public_id (T10)", async () => {
    const mockResult = {
      secure_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      public_id: "lostfound/sample_123",
    };

    vi.spyOn(cloudinary.uploader, "upload_stream").mockImplementation((options, callback) => {
      // Panggil callback secara asinkron dengan mockResult
      setTimeout(() => callback(null, mockResult), 10);
      return {
        write: vi.fn(),
        end: vi.fn(),
        on: vi.fn(),
        once: vi.fn(),
        emit: vi.fn(),
      };
    });

    const dummyBuffer = Buffer.from("sample image buffer");
    const result = await uploadImageStream(dummyBuffer, "lostfound");

    expect(result.secure_url).toBe(mockResult.secure_url);
    expect(result.public_id).toBe(mockResult.public_id);

    vi.restoreAllMocks();
  });

  it("should reject with 502 UPLOAD_FAILED when Cloudinary stream fails", async () => {
    vi.spyOn(cloudinary.uploader, "upload_stream").mockImplementation((options, callback) => {
      setTimeout(() => callback(new Error("Network timeout")), 10);
      return {
        write: vi.fn(),
        end: vi.fn(),
        on: vi.fn(),
        once: vi.fn(),
        emit: vi.fn(),
      };
    });

    const dummyBuffer = Buffer.from("sample image buffer");
    await expect(uploadImageStream(dummyBuffer)).rejects.toThrow(AppError);

    vi.restoreAllMocks();
  });

  it("should call cloudinary destroy when deleting an image", async () => {
    const destroySpy = vi
      .spyOn(cloudinary.uploader, "destroy")
      .mockResolvedValue({ result: "ok" });

    await deleteImage("lostfound/sample_123");

    expect(destroySpy).toHaveBeenCalledWith("lostfound/sample_123");

    vi.restoreAllMocks();
  });
});
