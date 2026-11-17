import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  STORE_DRIVER: process.env.STORE_DRIVER || "memory",
  DATABASE_URL: process.env.DATABASE_URL || "",
  DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED || "",
  NEON_BRANCH: process.env.NEON_BRANCH || "",
  NEON_BRANCH_ID: process.env.NEON_BRANCH_ID || "",
  NEON_REALTIME_URL: process.env.NEON_REALTIME_URL || "",
  NEON_REALTIME_SECRET: process.env.NEON_REALTIME_SECRET || "",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
};
