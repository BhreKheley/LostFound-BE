import { store } from "../store/index.js";
import { AppError } from "../lib/AppError.js";

export const getReportsService = async (query) => {
  return await store.listReports(query);
};

export const getReportByIdService = async (id) => {
  const report = await store.getReportById(id);
  if (!report) {
    throw new AppError("Laporan dengan ID tersebut tidak ditemukan", 404, "NOT_FOUND");
  }
  return report;
};

export const createReportService = async (reportData, file) => {
  // Pada Checkpoint 2 (STORE_DRIVER=memory), photoUrl diset null setelah validasi berkas berhasil
  const dataToSave = {
    ...reportData,
    photoUrl: null,
  };

  return await store.createReport(dataToSave);
};
