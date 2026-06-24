import { Router } from "express";

const router = Router();

// Простой health-check route.
// Он нужен, чтобы быстро понять: backend живой или нет.
router.get("/", (request, response) => {
  response.json({
    status: "ok",
    message: "Tailor CRM backend is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;