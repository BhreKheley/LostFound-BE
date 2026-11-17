import { createRealtime, rawSql } from "@neon/realtime/server";
import { env } from "../config/env.js";

let realtimeServerInstance = null;

/**
 * Initializes and returns the singleton Neon Realtime server instance.
 */
export const getRealtimeServer = () => {
  if (!env.NEON_REALTIME_SECRET) {
    return null;
  }
  if (!realtimeServerInstance) {
    realtimeServerInstance = createRealtime({
      secret: env.NEON_REALTIME_SECRET,
      db: "neondb",
    });
  }
  return realtimeServerInstance;
};

/**
 * Creates a sealed live query for active reports, safe for frontend subscriptions.
 * Excludes sensitive fields (editTokenHash, photoPublicId) in accordance with privacy rules.
 */
export const sealActiveReportsQuery = async () => {
  const server = getRealtimeServer();
  if (!server) {
    return null;
  }

  const query = rawSql(
    `SELECT r.id, r.type, r.title, r.description, r."locationDetail", r."eventDate", r."photoUrl", r."contactMethod", r."contactValue", r."reporterName", r.status, r."createdAt", r."updatedAt",
            c.id AS "category_id", c.name AS "category_name",
            l.id AS "location_id", l.name AS "location_name"
     FROM reports r
     JOIN categories c ON r."categoryId" = c.id
     JOIN locations l ON r."locationId" = l.id
     WHERE r.status = 'ACTIVE'
     ORDER BY r."createdAt" DESC`
  );

  return await server.seal({ query });
};

/**
 * Returns public configuration for client-side Neon Realtime subscriptions.
 */
export const getRealtimeConfig = async () => {
  if (!env.NEON_REALTIME_URL || !env.NEON_REALTIME_SECRET) {
    return {
      enabled: false,
      message: "Neon Realtime is not configured",
    };
  }

  const sealedQuery = await sealActiveReportsQuery();

  return {
    enabled: true,
    url: env.NEON_REALTIME_URL,
    branch: env.NEON_BRANCH || "production",
    sealedQuery,
  };
};
