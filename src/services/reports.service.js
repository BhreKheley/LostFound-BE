import { store } from "../store/index.js";
import { AppError } from "../lib/AppError.js";
import { uploadImageStream, deleteImage } from "../lib/cloudinary.js";

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
  let uploadResult = null;

  // 1. Jika ada berkas foto, unggah ke Cloudinary melalui streaming
  if (file && file.buffer) {
    uploadResult = await uploadImageStream(file.buffer, "lostfound");
  }

  const dataToSave = {
    ...reportData,
    photoUrl: uploadResult ? uploadResult.secure_url : null,
    photoPublicId: uploadResult ? uploadResult.public_id : null,
  };

  // 2. Simpan ke database dengan mekanisme rollback otomatis (T11)
  try {
    return await store.createReport(dataToSave);
  } catch (err) {
    if (uploadResult?.public_id) {
      console.warn(
        `[Rollback] Penyimpanan database gagal. Menghapus foto dari Cloudinary: ${uploadResult.public_id}`
      );
      await deleteImage(uploadResult.public_id);
    }
    throw err;
  }
};
