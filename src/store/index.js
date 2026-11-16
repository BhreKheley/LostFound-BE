import { env } from "../config/env.js";
import { memoryStore } from "./memory.store.js";
import { prismaStore } from "./prisma.store.js";

export const getStore = () => {
  if (env.STORE_DRIVER === "prisma") {
    return prismaStore;
  }
  return memoryStore;
};

export const store = getStore();
