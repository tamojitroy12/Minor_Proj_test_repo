from worker import build_status, compute_rate


def test_build_status_active_flag():
    result = build_status({"id": "abc", "active": "1"})
    assert result["state"] == "healthy"


def test_compute_rate_zero_total():
    assert compute_rate(0, 0) == 0.0
