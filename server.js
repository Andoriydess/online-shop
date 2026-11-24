import express from "express";
import db from "./db.js";
import { createItemService } from "./service/itemService.js";
import { createItemsRouter } from "./api/itemsRouter.js";
import { errorHandler } from "./api/errorHandler.js";

const app = express();

app.use(express.json());
app.use(express.static("client"));

app.get("/health", (req, res) => res.type("text").send("ok"));
app.use("/items", createItemsRouter(createItemService(db)));

app.use(errorHandler);

app.listen(3000, () => console.log("Server: http://localhost:3000"));