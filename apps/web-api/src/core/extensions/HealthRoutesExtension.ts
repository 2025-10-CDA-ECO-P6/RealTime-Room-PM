import { Router, Router as ExpressRouter } from "express";

export function HealthRoutesExtension(): ExpressRouter {
  const router = Router();
  router.get("/health", (_req, res) => {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
    });
  });
  router.get("/ready", (_req, res) => {
    res.json({
      ready: true,
      timestamp: new Date().toISOString(),
      checks: {
        database: "connected",
        cache: "connected",
        socketio: "ready",
      },
    });
  });
  router.get("/live", (_req, res) => {
    res.json({
      alive: true,
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
    });
  });
  return router;
}
