import multer from "multer";
import { AppError } from "../lib/AppError.js";

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new AppError(
        "Tipe berkas photo harus berupa JPEG, PNG, atau WebP",
        415,
        "UNSUPPORTED_MEDIA_TYPE"
      ),
      false
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter,
});

export const uploadSinglePhoto = upload.single("photo");
