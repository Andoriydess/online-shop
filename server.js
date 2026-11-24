import express from "express";
import db from "./db.js";

const app = express();

app.use(express.static("client"));

app.get("/items", (req, res) => {
  const items = db.prepare("SELECT id, name FROM items").all();
  res.json(items);
});

app.listen(3000, () => console.log("Server: http://localhost:3000"));