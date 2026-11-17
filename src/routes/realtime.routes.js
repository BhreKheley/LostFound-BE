import { Router } from "express";
import { getRealtimeConfig } from "../lib/realtime.js";
import { methodNotAllowed } from "../middleware/methodNotAllowed.js";

const router = Router();

router
  .route("/realtime/reports")
  .get(async (req, res, next) => {
    try {
      const config = await getRealtimeConfig();
      res.status(200).json(config);
    } catch (err) {
      next(err);
    }
  })
  .all(methodNotAllowed);

export default router;
