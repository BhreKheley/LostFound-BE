import { z } from "zod";
import { AppError } from "../lib/AppError.js";

export const CATEGORIES = [
  { id: 1, name: "KTM dan kartu identitas" },
  { id: 2, name: "Elektronik dan charger" },
  { id: 3, name: "Dompet dan uang" },
  { id: 4, name: "Botol minum" },
  { id: 5, name: "Payung dan jas hujan" },
  { id: 6, name: "Pakaian dan jaket" },
  { id: 7, name: "Kunci" },
  { id: 8, name: "Lain-lain" },
];

export const LOCATIONS = [
  { id: 1, name: "Ruang kelas" },
  { id: 2, name: "Laboratorium" },
  { id: 3, name: "Perpustakaan" },
  { id: 4, name: "Kantin" },
  { id: 5, name: "Selasar gedung baru" },
  { id: 6, name: "Lobi utama" },
  { id: 7, name: "Toilet" },
  { id: 8, name: "Mushola" },
  { id: 9, name: "Area parkir" },
];

export const REPORT_TYPES = ["LOST", "FOUND"];
export const CONTACT_METHODS = ["WHATSAPP", "LINE", "INSTAGRAM", "EMAIL"];
export const REPORT_STATUSES = ["ACTIVE", "RESOLVED"];

export const uuidParamSchema = z.object({
  id: z.string().uuid({ message: "Format ID laporan harus berupa UUID yang valid" }),
});

export const reportQuerySchema = z.object({
  q: z.string().min(1).max(100).optional(),
  type: z.enum(REPORT_TYPES).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  locationId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const createReportSchema = z
  .object({
    type: z.enum(REPORT_TYPES, {
      errorMap: () => ({ message: "Jenis laporan harus bernilai 'LOST' atau 'FOUND'" }),
    }),
    title: z
      .string({ required_error: "Nama barang wajib diisi" })
      .trim()
      .min(3, { message: "Nama barang minimal 3 karakter" })
      .max(100, { message: "Nama barang maksimal 100 karakter" }),
    description: z
      .string({ required_error: "Deskripsi barang wajib diisi" })
      .trim()
      .min(10, { message: "Deskripsi minimal 10 karakter" })
      .max(1000, { message: "Deskripsi maksimal 1000 karakter" }),
    categoryId: z.coerce
      .number({ required_error: "Kategori wajib dipilih" })
      .int()
      .refine((id) => CATEGORIES.some((c) => c.id === id), {
        message: "Kategori yang dipilih tidak valid",
      }),
    locationId: z.coerce
      .number({ required_error: "Lokasi wajib dipilih" })
      .int()
      .refine((id) => LOCATIONS.some((l) => l.id === id), {
        message: "Lokasi yang dipilih tidak valid",
      }),
    locationDetail: z
      .string()
      .trim()
      .max(100, { message: "Detail lokasi maksimal 100 karakter" })
      .optional()
      .nullable()
      .transform((val) => (val && val.trim() !== "" ? val.trim() : null)),
    eventDate: z
      .string({ required_error: "Tanggal kejadian wajib diisi" })
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Format tanggal harus YYYY-MM-DD",
      })
      .refine(
        (val) => {
          // Tanggal hari ini di zona waktu WIB (UTC+7)
          const nowWib = new Date(
            new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
          );
          const todayStr = nowWib.toISOString().slice(0, 10);
          return val <= todayStr;
        },
        { message: "Tanggal kejadian tidak boleh melebihi hari ini" }
      ),
    contactMethod: z.enum(CONTACT_METHODS, {
      errorMap: () => ({
        message: "Metode kontak harus salah satu dari: WHATSAPP, LINE, INSTAGRAM, EMAIL",
      }),
    }),
    contactValue: z
      .string({ required_error: "Kontak wajib diisi" })
      .trim()
      .min(1, { message: "Kontak tidak boleh kosong" }),
    reporterName: z
      .string()
      .trim()
      .max(50, { message: "Nama pelapor maksimal 50 karakter" })
      .optional()
      .nullable()
      .transform((val) => (val && val.trim() !== "" ? val.trim() : null)),
  })
  .superRefine((data, ctx) => {
    // Validasi & normalisasi spesifik per contactMethod
    if (data.contactMethod === "WHATSAPP") {
      let cleaned = data.contactValue.replace(/[^0-9+]/g, "");
      if (cleaned.startsWith("+")) cleaned = cleaned.substring(1);
      if (cleaned.startsWith("0")) cleaned = "62" + cleaned.substring(1);

      if (!/^628[0-9]{7,13}$/.test(cleaned)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["contactValue"],
          message: "Nomor WhatsApp belum benar. Tulis angka saja, misalnya 08123456789",
        });
      } else {
        data.contactValue = cleaned;
      }
    } else if (data.contactMethod === "LINE") {
      let cleaned = data.contactValue.replace(/^@+/, "").trim();
      if (cleaned.length < 1 || cleaned.length > 50) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["contactValue"],
          message: "ID LINE minimal 1 dan maksimal 50 karakter",
        });
      } else {
        data.contactValue = cleaned;
      }
    } else if (data.contactMethod === "INSTAGRAM") {
      let cleaned = data.contactValue.replace(/^@+/, "").trim();
      if (!/^[a-zA-Z0-9._]{1,30}$/.test(cleaned)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["contactValue"],
          message: "Username Instagram tidak valid (1-30 karakter)",
        });
      } else {
        data.contactValue = cleaned;
      }
    } else if (data.contactMethod === "EMAIL") {
      const emailParse = z.string().email().safeParse(data.contactValue.trim());
      if (!emailParse.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["contactValue"],
          message: "Format email belum benar, misalnya nama@ui.ac.id",
        });
      } else {
        data.contactValue = data.contactValue.trim().toLowerCase();
      }
    }
  });

export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const issues = result.error.issues || result.error.errors || [];
    const details = issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return next(new AppError("Data laporan tidak valid", 400, "VALIDATION_ERROR", details));
  }
  req.body = result.data;
  next();
};

export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    const issues = result.error.issues || result.error.errors || [];
    const details = issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return next(new AppError("Parameter query tidak valid", 400, "INVALID_QUERY", details));
  }
  req.validatedQuery = result.data;
  next();
};

export const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params);
  if (!result.success) {
    const issues = result.error.issues || result.error.errors || [];
    const details = issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return next(new AppError("Format ID laporan harus berupa UUID yang valid", 400, "INVALID_QUERY", details));
  }
  req.params = result.data;
  next();
};
