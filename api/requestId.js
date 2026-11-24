import { randomUUID } from "node:crypto";

export function requestId(req, res, next) {
  const rid = req.get("X-Request-Id") || randomUUID();
  res.locals.requestId = rid;
  res.setHeader("X-Request-Id", rid);
  next();
}