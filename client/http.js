const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const backoff = (base, attempt, jitter) =>
  base * 2 ** attempt + (jitter ? Math.floor(Math.random() * 100) : 0);

export async function fetchWithResilience(url, opts = {}) {
  const { retry = {}, idempotencyKey, requestId, ...init } = opts;
  const { retries = 2, baseDelayMs = 250, timeoutMs = 3000, jitter = true } = retry;

  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");
  if (idempotencyKey) headers.set("Idempotency-Key", idempotencyKey);
  headers.set("X-Request-Id", requestId ?? crypto.randomUUID());

  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, headers, signal: controller.signal });

      if (res.status === 429 && attempt < retries) {
        await sleep(Number(res.headers.get("Retry-After") || 1) * 1000);
        continue;
      }
      if ([500, 502, 503, 504].includes(res.status) && attempt < retries) {
        await sleep(backoff(baseDelayMs, attempt, jitter));
        continue;
      }
      return res;
    } catch (e) {
      // мережевий збій або таймаут (AbortError)
      if (attempt >= retries) throw e;
      await sleep(backoff(baseDelayMs, attempt, jitter));
    } finally {
      clearTimeout(timer);
    }
  }
}