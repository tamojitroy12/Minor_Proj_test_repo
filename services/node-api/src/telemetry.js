const { MeterProvider, PeriodicExportingMetricReader } = require("@opentelemetry/sdk-metrics");
const { OTLPMetricExporter } = require("@opentelemetry/exporter-metrics-otlp-http");
const { Resource } = require("@opentelemetry/resources");
const {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
} = require("@opentelemetry/semantic-conventions");

let started = false;

const requestCounterRef = { current: null };
const requestDurationRef = { current: null };

function resolveMetricsEndpoint() {
  if (process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT) {
    return process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT;
  }

  if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    const base = process.env.OTEL_EXPORTER_OTLP_ENDPOINT.replace(/\/$/, "");
    return `${base}/v1/metrics`;
  }

  return "http://localhost:4318/v1/metrics";
}

function initTelemetry() {
  if (started) {
    return;
  }

  const exporter = new OTLPMetricExporter({
    url: resolveMetricsEndpoint(),
  });

  const meterProvider = new MeterProvider({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || "node-api",
      [SEMRESATTRS_SERVICE_VERSION]: "0.0.1",
      deployment_environment: process.env.NODE_ENV || "development",
    }),
  });

  const reader = new PeriodicExportingMetricReader({
    exporter,
    exportIntervalMillis: Number(process.env.OTEL_METRIC_EXPORT_INTERVAL_MS || 5000),
  });
  meterProvider.addMetricReader(reader);

  const meter = meterProvider.getMeter("node-api-meter");
  requestCounterRef.current = meter.createCounter("http_server_requests_total", {
    description: "Total number of inbound HTTP requests",
  });
  requestDurationRef.current = meter.createHistogram("http.server.request.duration", {
  description: "Duration of HTTP server requests",
  unit: "s",
  advice: { explicitBucketBoundaries: [0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1, 2.5, 5, 7.5, 10] },
});


  started = true;
}

function recordRequest(method, route, statusCode, durationMs) {
  if (!requestCounterRef.current || !requestDurationRef.current) {
    return;
  }

  const attrs = {
  "http.request.method": method,
  "http.route": route,
  "http.response.status_code": statusCode,
};
requestCounterRef.current.add(1, attrs);
requestDurationRef.current.record(durationMs / 1000, attrs);
}

module.exports = {
  initTelemetry,
  recordRequest,
};
