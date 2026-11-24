export class Payment {
  constructor(id, orderId, amount) {
    this.id = id;
    this.orderId = orderId;
    this.amount = amount;
    this.status = "pending";
  }

  markSuccess() {
    this.status = "success";
  }

  markFailed() {
    this.status = "failed";
  }
}