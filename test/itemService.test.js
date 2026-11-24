import test from "node:test";
import assert from "node:assert/strict";
import Database from "better-sqlite3";
import { initSchema } from "../schema.js";
import { createItemService } from "../service/itemService.js";
import { ValidationError } from "../service/errors.js";

function makeService() {
  const db = new Database(":memory:");
  initSchema(db);
  return createItemService(db);
}

test("create: коректні дані повертають створений товар", () => {
  const service = makeService();
  const item = service.create({ name: "Кружка", price: 150 });

  assert.equal(item.name, "Кружка");
  assert.equal(item.price, 150);
  assert.ok(item.id);
  assert.equal(service.list().length, 1);
});

test("create: відсутнє обов'язкове поле name дає ValidationError", () => {
  const service = makeService();

  assert.throws(
    () => service.create({ price: 100 }),
    (err) => err instanceof ValidationError && err.details[0].field === "name"
  );
});