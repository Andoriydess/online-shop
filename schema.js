export function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      price       REAL NOT NULL DEFAULT 0,
      description TEXT NOT NULL DEFAULT '',
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    )
  `);
}

export function seed(db) {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM items").get();
  if (count > 0) return;
  const now = new Date().toISOString();
  const insert = db.prepare(
    "INSERT INTO items (name, price, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
  );
  [
    ["Футболка", 400, "Бавовняна футболка"],
    ["Кружка", 150, "Керамічна кружка"],
    ["Рюкзак", 1200, "Міський рюкзак"],
    ["Блокнот", 80, "Блокнот А5"],
  ].forEach(([n, p, d]) => insert.run(n, p, d, now, now));
}