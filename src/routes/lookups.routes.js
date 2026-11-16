import { Router } from "express";
import { CATEGORIES, LOCATIONS } from "../validators/report.schema.js";

const router = Router();

router.get("/categories", (req, res) => {
  res.status(200).json({ data: CATEGORIES });
});

router.get("/locations", (req, res) => {
  res.status(200).json({ data: LOCATIONS });
});

export default router;
