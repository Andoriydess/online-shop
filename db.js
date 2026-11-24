import Database from "better-sqlite3";

const db = new Database("shop.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`);

const { count } = db.prepare("SELECT COUNT(*) AS count FROM items").get();
if (count === 0) {
  const insert = db.prepare("INSERT INTO items (name) VALUES (?)");
  ["Футболка", "Кружка", "Рюкзак", "Блокнот"].forEach((n) => insert.run(n));
}

export default db;