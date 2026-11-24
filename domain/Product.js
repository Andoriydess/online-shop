export class Product {
  constructor({ id = null, name, price = 0, description = "", createdAt = null, updatedAt = null }) {
    if (typeof name !== "string" || name.trim() === "") {
      throw new Error("Product name must not be empty");
    }
    if (typeof price !== "number" || price < 0) {
      throw new Error("Product price must be >= 0");
    }
    this.id = id;
    this.name = name.trim();
    this.price = price;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}