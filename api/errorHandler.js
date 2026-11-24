import { ValidationError, NotFoundError } from "../service/errors.js";

const body = (res, error, code, details = null) => ({
  error,
  code,
  details,
  requestId: res.locals.requestId,
});

export function errorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(400).json(body(res, "ValidationError", err.code, err.details));
  }
  if (err instanceof NotFoundError) {
    return res
      .status(404)
      .json(body(res, "NotFound", "ITEM_NOT_FOUND", [{ field: "id", message: err.message }]));
  }
  if (err.type === "entity.parse.failed") {
    return res
      .status(400)
      .json(body(res, "ValidationError", "INVALID_JSON", [{ field: "body", message: "Request body is not valid JSON" }]));
  }
  console.error(err);
  res.status(500).json(body(res, "InternalError", "INTERNAL_ERROR"));
}