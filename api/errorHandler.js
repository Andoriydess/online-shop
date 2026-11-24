import { ValidationError, NotFoundError } from "../service/errors.js";

export function errorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: "ValidationError",
      code: err.code,
      details: err.details,
    });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({
      error: "NotFound",
      code: "ITEM_NOT_FOUND",
      details: [{ field: "id", message: err.message }],
    });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "ValidationError",
      code: "INVALID_JSON",
      details: [{ field: "body", message: "Request body is not valid JSON" }],
    });
  }
  console.error(err);
  res.status(500).json({ error: "InternalError", code: "INTERNAL_ERROR", details: [] });
}