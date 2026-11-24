export class ValidationError extends Error {
  constructor(details, code = "VALIDATION_FAILED") {
    super("Validation failed");
    this.name = "ValidationError";
    this.code = code;
    this.details = details;
  }
}

export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}