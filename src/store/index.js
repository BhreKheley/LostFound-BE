import { env } from "../config/env.js";
import { memoryStore } from "./memory.store.js";

export const getStore = () => {
  if (env.STORE_DRIVER === "memory") {
    return memoryStore;
  }
  // Default fallback to memoryStore
  return memoryStore;
};

export const store = getStore();
