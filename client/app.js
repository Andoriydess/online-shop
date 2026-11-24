import { fetchWithResilience } from "./http.js";
import { getOrReuseKey, releaseKey } from "./idempotency.js";

const FAIL_LIMIT = 3;      // стільки збоїв поспіль вмикають degraded mode
const COOLDOWN_MS = 5000;  // на скільки кнопки блокуються

const banner = document.getElementById("banner");
const logEl = document.getElementById("log");
const titleInput = document.getElementById("title");
const buttons = () => document.querySelectorAll("button");

let failures = 0;

const log = (msg) => {
  logEl.textContent = `${new Date().toLocaleTimeString()}  ${msg}\n` + logEl.textContent;
};

function enterDegraded() {
  banner.hidden = false;
  buttons().forEach((b) => (b.disabled = true));
  log("DEGRADED MODE: сервер перевантажено");
  setTimeout(() => {
    banner.hidden = true;
    buttons().forEach((b) => (b.disabled = false));
    failures = 0;
    log("Degraded mode вимкнено");
  }, COOLDOWN_MS);
}

function track(ok) {
  if (ok) {
    failures = 0;
    return;
  }
  failures++;
  if (failures >= FAIL_LIMIT) enterDegraded();
}

const RETRY = { retries: 2, baseDelayMs: 300, timeoutMs: 3500, jitter: true };

async function send(payload, key) {
  try {
    const res = await fetchWithResilience("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
      idempotencyKey: key,
      retry: RETRY,
    });
    const data = await res.json();
    track(res.status < 500 && res.status !== 429);
    return { status: res.status, data };
  } catch (e) {
    track(false);
    return { status: "network/timeout", data: { error: e.name } };
  }
}

document.getElementById("create").addEventListener("click", async () => {
  const payload = { title: titleInput.value || "Untitled" };
  const key = await getOrReuseKey(payload);
  const r = await send(payload, key);
  log(`POST /orders -> ${r.status} ${JSON.stringify(r.data)}`);
  if (r.status === 201) await releaseKey(payload);
});

document.getElementById("double").addEventListener("click", async () => {
  const payload = { title: titleInput.value || "Milk" };
  const key = await getOrReuseKey(payload);
  const [a, b] = await Promise.all([send(payload, key), send(payload, key)]);
  log(`Double submit: #1 ${a.status} id=${a.data.id}, #2 ${b.status} id=${b.data.id}`);
  if (a.status === 201 || b.status === 201) await releaseKey(payload);
});

document.getElementById("health").addEventListener("click", async () => {
  try {
    const res = await fetchWithResilience("/health", { retry: { retries: 0, timeoutMs: 1000 } });
    log(`GET /health -> ${res.status} ${JSON.stringify(await res.json())}`);
  } catch (e) {
    log(`GET /health скасовано (${e.name}): відповідь довша за 1 с`);
  }
});

document.getElementById("load").addEventListener("click", async () => {
  const list = document.getElementById("list");
  list.innerHTML = "";
  try {
    const items = await (await fetch("/items")).json();
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.id}. ${item.name}`;
      list.appendChild(li);
    });
  } catch {
    list.textContent = "Помилка завантаження";
  }
});