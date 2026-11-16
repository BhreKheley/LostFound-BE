import {
  getReportsService,
  getReportByIdService,
  createReportService,
} from "../services/reports.service.js";

export const getReportsController = async (req, res, next) => {
  try {
    const result = await getReportsService(req.validatedQuery || req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getReportByIdController = async (req, res, next) => {
  try {
    const report = await getReportByIdService(req.params.id);
    res.status(200).json({ data: report });
  } catch (err) {
    next(err);
  }
};

export const createReportController = async (req, res, next) => {
  try {
    const newReport = await createReportService(req.body, req.file);
    res.setHeader("Location", `/reports/${newReport.id}`);
    res.status(201).json({ data: newReport });
  } catch (err) {
    next(err);
  }
};
