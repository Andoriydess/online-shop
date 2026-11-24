import express from "express";
import db from "./db.js";
import { createItemService } from "./service/itemService.js";
import { createOrderService } from "./service/orderService.js";
import { createItemsRouter } from "./api/itemsRouter.js";
import { createOrdersRouter } from "./api/ordersRouter.js";
import { requestId } from "./api/requestId.js";
import { rateLimit } from "./api/rateLimit.js";
import { chaos } from "./api/chaos.js";
import { errorHandler } from "./api/errorHandler.js";

const app = express();

app.use(requestId);
app.use(express.json());
app.use(express.static("client"));

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/items", createItemsRouter(createItemService(db)));
app.use("/orders", rateLimit, chaos, createOrdersRouter(createOrderService()));

app.use(errorHandler);

app.listen(3000, () => console.log("Server: http://localhost:3000"));