import { Router } from "express";
import {
  getReportsController,
  getReportByIdController,
  createReportController,
} from "../controllers/reports.controller.js";
import {
  validateBody,
  validateQuery,
  validateParams,
  createReportSchema,
  reportQuerySchema,
  uuidParamSchema,
} from "../validators/report.schema.js";
import { uploadSinglePhoto } from "../middleware/upload.js";
import { methodNotAllowed } from "../middleware/methodNotAllowed.js";

const router = Router();

router
  .route("/")
  .get(validateQuery(reportQuerySchema), getReportsController)
  .post(uploadSinglePhoto, validateBody(createReportSchema), createReportController)
  .all(methodNotAllowed);

router
  .route("/:id")
  .get(validateParams(uuidParamSchema), getReportByIdController)
  .all(methodNotAllowed);

export default router;
