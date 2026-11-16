import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { env } from "../config/env.js";
import { AppError } from "./AppError.js";

// Konfigurasi kredensial Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Mengunggah buffer berkas ke Cloudinary menggunakan streaming
 * @param {Buffer} buffer - Buffer berkas gambar dari Multer
 * @param {string} folder - Folder tujuan di Cloudinary (default: "lostfound")
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
export const uploadImageStream = (buffer, folder = "lostfound") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("[Cloudinary Upload Error]:", error);
          return reject(
            new AppError("Gagal mengunggah foto ke Cloudinary", 502, "UPLOAD_FAILED")
          );
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

/**
 * Menghapus gambar dari Cloudinary berdasarkan public_id (mekanisme rollback)
 * @param {string} publicId - ID publik aset di Cloudinary
 */
export const deleteImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(`[Cloudinary Destroy Error] Gagal menghapus asset ${publicId}:`, err);
  }
};

export { cloudinary };
