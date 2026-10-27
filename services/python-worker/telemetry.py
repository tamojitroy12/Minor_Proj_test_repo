import os

from opentelemetry import metrics
from opentelemetry.exporter.otlp.proto.http.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import Resource


def _metrics_endpoint() -> str:
    metrics_endpoint = os.getenv("OTEL_EXPORTER_OTLP_METRICS_ENDPOINT")
    if metrics_endpoint:
        return metrics_endpoint

    base_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
    if base_endpoint:
        return f"{base_endpoint.rstrip('/')}/v1/metrics"

    return "http://localhost:4318/v1/metrics"


def init_metrics() -> None:
    exporter = OTLPMetricExporter(endpoint=_metrics_endpoint())
    export_interval_ms = int(os.getenv("OTEL_METRIC_EXPORT_INTERVAL_MS", "5000"))

    reader = PeriodicExportingMetricReader(
        exporter=exporter,
        export_interval_millis=export_interval_ms,
    )

    resource = Resource.create(
        {
            "service.name": os.getenv("OTEL_SERVICE_NAME", "python-worker"),
            "service.version": "0.0.1",
            "deployment.environment": os.getenv("ENVIRONMENT", "development"),
        }
    )
    provider = MeterProvider(resource=resource, metric_readers=[reader])
    metrics.set_meter_provider(provider)


init_metrics()
_meter = metrics.get_meter("python-worker-meter")

build_status_calls = _meter.create_counter(
    name="worker_build_status_total",
    description="Total calls to build_status",
)

compute_rate_calls = _meter.create_counter(
    name="worker_compute_rate_total",
    description="Total calls to compute_rate",
)

compute_rate_value = _meter.create_histogram(
    name="worker_compute_rate_value",
    description="Observed values returned by compute_rate",
)
