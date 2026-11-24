const WINDOW_MS = 10_000;
const MAX_REQ = 8;
const buckets = new Map(); // ip -> { count, ts }

export function rateLimit(req, res, next) {
  const ip = req.ip || "local";
  const now = Date.now();
  const b = buckets.get(ip);
  const state = b && now - b.ts < WINDOW_MS ? { count: b.count + 1, ts: b.ts } : { count: 1, ts: now };
  buckets.set(ip, state);

  if (state.count > MAX_REQ) {
    res.setHeader("Retry-After", "2");
    return res.status(429).json({
      error: "too_many_requests",
      code: "RATE_LIMITED",
      details: null,
      requestId: res.locals.requestId,
    });
  }
  next();
}