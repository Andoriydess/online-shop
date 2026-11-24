import { randomUUID } from "node:crypto";
import { ValidationError } from "./errors.js";

export function createOrderService() {
  const store = new Map(); // Idempotency-Key -> order

  return {
    create(key, data) {
      if (!key) {
        throw new ValidationError(
          [{ field: "Idempotency-Key", message: "Header is required" }],
          "IDEMPOTENCY_KEY_REQUIRED"
        );
      }
      if (store.has(key)) return store.get(key);

      const title = typeof data?.title === "string" && data.title.trim() ? data.title.trim() : "Untitled";
      const order = { id: "ord_" + randomUUID().slice(0, 8), title };
      store.set(key, order);
      return order;
    },
  };
}