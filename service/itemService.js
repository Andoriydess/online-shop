import { Product } from "../domain/Product.js";
import { ValidationError, NotFoundError } from "./errors.js";

function validate(data) {
  const details = [];

  const name = typeof data.name === "string" ? data.name.trim() : "";
  if (name === "") {
    details.push({ field: "name", message: "Name is required" });
  }

  const price = data.price === undefined ? 0 : data.price;
  if (typeof price !== "number" || Number.isNaN(price) || price < 0) {
    details.push({ field: "price", message: "Price must be a non-negative number" });
  }

  const description = data.description === undefined ? "" : data.description;
  if (typeof description !== "string") {
    details.push({ field: "description", message: "Description must be a string" });
  }

  if (details.length > 0) throw new ValidationError(details);
  return { name, price, description };
}

const toDto = (r) => ({
  id: r.id,
  name: r.name,
  price: r.price,
  description: r.description,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export function createItemService(db) {
  const findRow = (id) =>
    Number.isInteger(id) ? db.prepare("SELECT * FROM items WHERE id = ?").get(id) : undefined;

  const getOrThrow = (id) => {
    const row = findRow(id);
    if (!row) throw new NotFoundError(`Item ${id} not found`);
    return row;
  };

  return {
    list() {
      return db.prepare("SELECT * FROM items ORDER BY id").all().map(toDto);
    },

    get(id) {
      return toDto(getOrThrow(id));
    },

    create(data) {
      const product = new Product(validate(data));
      const now = new Date().toISOString();
      const info = db
        .prepare(
          "INSERT INTO items (name, price, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
        )
        .run(product.name, product.price, product.description, now, now);
      return toDto(getOrThrow(Number(info.lastInsertRowid)));
    },

    update(id, data) {
      getOrThrow(id);
      const product = new Product(validate(data));
      db.prepare(
        "UPDATE items SET name = ?, price = ?, description = ?, updated_at = ? WHERE id = ?"
      ).run(product.name, product.price, product.description, new Date().toISOString(), id);
      return toDto(getOrThrow(id));
    },

    remove(id) {
      getOrThrow(id);
      db.prepare("DELETE FROM items WHERE id = ?").run(id);
    },
  };
}