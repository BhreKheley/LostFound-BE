import { Router } from "express";
import lookupsRoutes from "./lookups.routes.js";
import reportsRoutes from "./reports.routes.js";

const router = Router();

// Endpoint lookups: /categories dan /locations
router.use("/", lookupsRoutes);

// Endpoint reports: /reports dan /reports/:id
router.use("/reports", reportsRoutes);

export default router;
