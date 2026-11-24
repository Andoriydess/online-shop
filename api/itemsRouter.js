import { Router } from "express";

export function createItemsRouter(service) {
  const router = Router();

  router.post("/", (req, res) => {
    res.status(201).json(service.create(req.body ?? {}));
  });

  router.get("/", (req, res) => {
    res.json(service.list());
  });

  router.get("/:id", (req, res) => {
    res.json(service.get(Number(req.params.id)));
  });

  router.put("/:id", (req, res) => {
    res.json(service.update(Number(req.params.id), req.body ?? {}));
  });

  router.delete("/:id", (req, res) => {
    service.remove(Number(req.params.id));
    res.status(204).end();
  });

  return router;
}