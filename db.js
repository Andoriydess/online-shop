import Database from "better-sqlite3";
import { initSchema, seed } from "./schema.js";

const db = new Database("shop.db");
initSchema(db);
seed(db);

export default db;