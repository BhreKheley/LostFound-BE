import app from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => {
  console.log(`[Lost & Found Pacil API] Running on http://localhost:${env.PORT}`);
  console.log(`[Environment] ${env.NODE_ENV} | Store: ${env.STORE_DRIVER}`);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
