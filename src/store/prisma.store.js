import { prisma } from "../lib/prisma.js";

/**
 * Pemilihan kolom ketat (Projection) demi menjamin privasi pengguna (T12).
 * Kolom internal rahasia seperti `photoPublicId` dan `editTokenHash`
 * TIDAK PERNAH disertakan pada respons publik mana pun.
 */
export const publicReportSelect = {
  id: true,
  type: true,
  title: true,
  description: true,
  locationDetail: true,
  eventDate: true,
  photoUrl: true,
  contactMethod: true,
  contactValue: true,
  reporterName: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  location: {
    select: {
      id: true,
      name: true,
    },
  },
};

const formatReport = (report) => {
  if (!report) return null;
  return {
    ...report,
    eventDate:
      report.eventDate instanceof Date
        ? report.eventDate.toISOString().slice(0, 10)
        : report.eventDate,
  };
};

export class PrismaStore {
  async listReports(query = {}) {
    const { q, type, categoryId, locationId, page = 1, limit = 12 } = query;

    const where = {};

    // 1. Pencarian case-insensitive pada title
    if (q && q.trim() !== "") {
      where.title = {
        contains: q.trim(),
        mode: "insensitive",
      };
    }

    // 2. Filter tipe ('LOST' | 'FOUND')
    if (type) {
      where.type = type;
    }

    // 3. Filter categoryId
    if (categoryId !== undefined && categoryId !== null) {
      where.categoryId = Number(categoryId);
    }

    // 4. Filter locationId
    if (locationId !== undefined && locationId !== null) {
      where.locationId = Number(locationId);
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 12);
    const skip = (pageNum - 1) * limitNum;

    // Eksekusi query data dan hitung total secara atomik dalam satu transaksi
    const [reports, total] = await prisma.$transaction([
      prisma.report.findMany({
        where,
        select: publicReportSelect,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.report.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 0;

    return {
      data: reports.map(formatReport),
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    };
  }

  async getReportById(id) {
    const report = await prisma.report.findUnique({
      where: { id },
      select: publicReportSelect,
    });
    return formatReport(report);
  }

  async createReport(input) {
    const report = await prisma.report.create({
      data: {
        type: input.type,
        title: input.title,
        description: input.description,
        categoryId: Number(input.categoryId),
        locationId: Number(input.locationId),
        locationDetail: input.locationDetail || null,
        eventDate: new Date(input.eventDate),
        photoUrl: input.photoUrl || null,
        photoPublicId: input.photoPublicId || null,
        contactMethod: input.contactMethod,
        contactValue: input.contactValue,
        reporterName: input.reporterName || null,
        status: input.status || "ACTIVE",
        editTokenHash: input.editTokenHash || null,
      },
      select: publicReportSelect,
    });

    return formatReport(report);
  }
}

export const prismaStore = new PrismaStore();
