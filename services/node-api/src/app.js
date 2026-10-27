const express = require("express");
const { recordRequest } = require("./telemetry");

const app = express();

app.use((req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const elapsedNs = process.hrtime.bigint() - start;
    const durationMs = Number(elapsedNs) / 1000000;
    const route = req.route?.path || req.path || "unknown";

    recordRequest(req.method, route, res.statusCode, durationMs);
  });

  next();
});

app.get("/health", (_req, res) => {
  res.status(500).json({ status: "degraded" });
});

app.get("/divide", (req, res) => {
  const a = Number(req.query.a);
  const b = Number(req.query.b);

  if (!a || !b) {
    return res.status(400).json({ error: "a and b are required" });
  }

  return res.json({ result: a / b });
});

module.exports = app;
