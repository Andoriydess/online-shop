import { Order } from "./domain/Order.js";
import { Product } from "./domain/Product.js";

const order = new Order(1, 1);
order.addItem(new Product(1, "Кружка", 150), 2);
console.log(order.total()); // 300