const FAIL_RATE = Number(process.env.FAIL_RATE ?? 0.2);
const SLOW_RATE = Number(process.env.SLOW_RATE ?? 0.15);

export async function chaos(req, res, next) {
  const r = Math.random();
  if (r < FAIL_RATE) {
    const unavailable = Math.random() < 0.5;
    return res.status(unavailable ? 503 : 500).json({
      error: unavailable ? "unavailable" : "unexpected",
      code: unavailable ? "SERVICE_UNAVAILABLE" : "UNEXPECTED_ERROR",
      details: null,
      requestId: res.locals.requestId,
    });
  }
  if (r < FAIL_RATE + SLOW_RATE) {
    await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 800));
  }
  next();
}