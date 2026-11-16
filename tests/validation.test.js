import { describe, it, expect } from "vitest";
import {
  createReportSchema,
  reportQuerySchema,
  uuidParamSchema,
} from "../src/validators/report.schema.js";

describe("Validation Schemas (Zod)", () => {
  const validReportData = {
    type: "LOST",
    title: "Tumbler biru Tupperware",
    description: "Tumbler biru tutup putih, ada stiker kucing di badan. Tertinggal setelah kuliah pagi.",
    categoryId: 4,
    locationId: 1,
    locationDetail: "Ruang A206",
    eventDate: "2026-11-12",
    contactMethod: "WHATSAPP",
    contactValue: "081234567890",
    reporterName: "Rani",
  };

  it("should successfully validate and normalize valid report data with WhatsApp", () => {
    const result = createReportSchema.safeParse(validReportData);
    expect(result.success).toBe(true);

    if (result.success) {
      // Normalisasi nomor WhatsApp 08xx -> 628xx
      expect(result.data.contactValue).toBe("6281234567890");
    }
  });

  it("should normalize Instagram and Line contact values", () => {
    const igResult = createReportSchema.safeParse({
      ...validReportData,
      contactMethod: "INSTAGRAM",
      contactValue: "@rani_fasilkom",
    });
    expect(igResult.success).toBe(true);
    if (igResult.success) {
      expect(igResult.data.contactValue).toBe("rani_fasilkom");
    }

    const lineResult = createReportSchema.safeParse({
      ...validReportData,
      contactMethod: "LINE",
      contactValue: "@raniline",
    });
    expect(lineResult.success).toBe(true);
    if (lineResult.success) {
      expect(lineResult.data.contactValue).toBe("raniline");
    }
  });

  it("should reject report with missing required fields", () => {
    const result = createReportSchema.safeParse({});
    expect(result.success).toBe(false);

    if (!result.success) {
      const fields = (result.error.issues || []).map((i) => i.path[0]);
      expect(fields).toContain("type");
      expect(fields).toContain("title");
      expect(fields).toContain("description");
      expect(fields).toContain("categoryId");
      expect(fields).toContain("locationId");
      expect(fields).toContain("eventDate");
      expect(fields).toContain("contactMethod");
      expect(fields).toContain("contactValue");
    }
  });

  it("should reject report with future eventDate (T2)", () => {
    const result = createReportSchema.safeParse({
      ...validReportData,
      eventDate: "2099-12-31",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const dateIssue = (result.error.issues || []).find((i) => i.path.includes("eventDate"));
      expect(dateIssue).toBeDefined();
      expect(dateIssue.message).toContain("tidak boleh melebihi hari ini");
    }
  });

  it("should reject invalid categoryId and locationId (T3)", () => {
    const result = createReportSchema.safeParse({
      ...validReportData,
      categoryId: 999,
      locationId: 999,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = (result.error.issues || []).map((i) => i.path[0]);
      expect(issues).toContain("categoryId");
      expect(issues).toContain("locationId");
    }
  });

  it("should reject invalid phone and email format (T4)", () => {
    const badWa = createReportSchema.safeParse({
      ...validReportData,
      contactMethod: "WHATSAPP",
      contactValue: "12345",
    });
    expect(badWa.success).toBe(false);

    const badEmail = createReportSchema.safeParse({
      ...validReportData,
      contactMethod: "EMAIL",
      contactValue: "bukan-email",
    });
    expect(badEmail.success).toBe(false);
  });

  it("should validate and apply default values to query parameters", () => {
    const result = reportQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(12);
    }
  });

  it("should validate UUID parameter correctly", () => {
    const validUuid = "6b1f6a52-3c1b-4a7e-9c55-0d6a1f2e8b01";
    expect(uuidParamSchema.safeParse({ id: validUuid }).success).toBe(true);
    expect(uuidParamSchema.safeParse({ id: "invalid-uuid" }).success).toBe(false);
  });
});
