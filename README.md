# Broken Polyglot Monorepo (Node + Python)

This repo is intentionally **broken** for testing SRE and code-health tooling.

## Layout

- `services/node-api`: small Express API (npm workspace)
- `services/python-worker`: small Python worker module

## Intentional Problems

1. Node tests fail (`health` endpoint expectation does not match implementation).
2. Node runtime bug: `/divide` can crash on bad query input.
3. Node script issue: root `smoke` script calls a missing workspace script.
4. Python tests fail (behavior mismatch + unhandled key access).
5. Python runtime bug: division by zero can occur in `compute_rate`.
6. Dependency mismatch: Python requirement range is intentionally stale.

## Quick Commands

### Node

```bash
npm install
npm run test:node
npm run start:node
```

Set OTLP endpoint for Node metrics export:

```bash
set OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://YOUR-COLLECTOR:43187/v1/metrics
set OTEL_SERVICE_NAME=node-api
npm run start:node
```

### Python

```bash
cd services/python-worker
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
pytest -q
```

Set OTLP endpoint for Python metrics export:

```bash
set OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://YOUR-COLLECTOR:4318/v1/metrics
set OTEL_SERVICE_NAME=python-worker
pytest -q
```

## Telemetry

- Node API exports OTLP metrics over HTTP from `services/node-api/src/telemetry.js`.
- Python worker exports OTLP metrics over HTTP from `services/python-worker/telemetry.py`.
- If `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT` is unset, both services fall back to:
	- `OTEL_EXPORTER_OTLP_ENDPOINT + /v1/metrics` when available
	- `http://localhost:4318/v1/metrics` otherwise

## Notes

The breakages are deliberate and meant for automated detection and remediation testing.
