import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";

let prismaInstance = null;

export const getPrismaClient = () => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }
  return prismaInstance;
};

export const prisma = new Proxy(
  {},
  {
    get: (target, prop) => {
      const client = getPrismaClient();
      return client[prop];
    },
  }
);
