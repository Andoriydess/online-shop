import { Router } from "express";

export function createOrdersRouter(service) {
  const router = Router();

  router.post("/", (req, res) => {
    const order = service.create(req.get("Idempotency-Key"), req.body ?? {});
    res.status(201).json({ ...order, requestId: res.locals.requestId });
  });

  return router;
}