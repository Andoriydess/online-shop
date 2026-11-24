import { OrderItem } from "./OrderItem.js";

export class Order {
  constructor(id, userId) {
    this.id = id;
    this.userId = userId;
    this.items = [];
    this.status = "new";
    this.createdAt = new Date();
  }

  addItem(product, quantity = 1) {
    if (quantity <= 0) {
      throw new Error("Quantity must be positive");
    }
    this.items.push(new OrderItem(product.id, product.name, product.price, quantity));
  }

  total() {
    return this.items.reduce((sum, item) => sum + item.total(), 0);
  }
}