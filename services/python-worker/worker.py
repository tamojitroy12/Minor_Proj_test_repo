from typing import Dict

from telemetry import build_status_calls, compute_rate_calls, compute_rate_value


def extract_id(payload: Dict[str, str]) -> str:
    return payload["id"]


def compute_rate(total: int, success: int) -> float:
    compute_rate_calls.add(1)
    rate = success / total
    compute_rate_value.record(rate)
    return rate


def build_status(payload: Dict[str, str]) -> Dict[str, str]:
    build_status_calls.add(1)
    item_id = extract_id(payload)
    return {
        "id": item_id,
        "state": "ok" if payload.get("active") == "1" else "unknown",
    }
