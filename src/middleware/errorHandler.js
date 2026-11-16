import { AppError } from "../lib/AppError.js";

export const errorHandler = (err, req, res, next) => {
  // 1. Operational AppError
  if (err instanceof AppError) {
    const response = {
      error: {
        code: err.code,
        message: err.message,
      },
    };
    if (err.details) {
      response.error.details = err.details;
    }
    return res.status(err.statusCode).json(response);
  }

  // 2. Multer limits (file size > 5MB)
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: {
        code: "FILE_TOO_LARGE",
        message: "Ukuran file foto melebihi batas maksimum 5MB",
      },
    });
  }

  // 3. Fallback for unexpected internal errors
  console.error("[Internal Server Error]:", err);
  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Terjadi kesalahan internal pada server",
    },
  });
};
