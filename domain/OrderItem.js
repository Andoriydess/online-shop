export class OrderItem {
  constructor(productId, productName, unitPrice, quantity) {
    this.productId = productId;
    this.productName = productName;
    this.unitPrice = unitPrice;
    this.quantity = quantity;
  }

  total() {
    return this.unitPrice * this.quantity;
  }
}