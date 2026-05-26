#!/usr/bin/env python3
"""
RabbitMQ Metrics Poller
-----------------------
Management REST API를 주기적으로 폴링해서 CSV로 저장합니다.

Usage:
    python rmq_metrics.py [--interval 10] [--output ./metrics] [--label experiment-1]

Env:
    RMQ_HOST     RabbitMQ Management URL (e.g. https://rabbitmq.codedang.com)
    RMQ_USER     Username
    RMQ_PASS     Password
"""

import argparse
import csv
import os
import signal
import sys
import time
from datetime import datetime, timezone

import requests
from requests.auth import HTTPBasicAuth

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
RMQ_HOST = os.getenv("RMQ_HOST", "https://rabbitmq.codedang.com")
RMQ_USER = os.getenv("RMQ_USER", "guest")
RMQ_PASS = os.getenv("RMQ_PASS", "guest")

# ---------------------------------------------------------------------------
# CSV column definitions
# ---------------------------------------------------------------------------

OVERVIEW_COLS = [
    "timestamp",
    "label",
    # Message rates (global)
    "publish_rate",
    "deliver_rate",
    "ack_rate",
    "redeliver_rate",
    # Queue totals
    "messages_ready",
    "messages_unacked",
    "messages_total",
    # Connections / Channels
    "connection_count",
    "channel_count",
    "queue_count",
    "consumer_count",
]

NODE_COLS = [
    "timestamp",
    "label",
    "node",
    # Memory
    "mem_used_mb",
    "mem_limit_mb",
    "mem_used_pct",
    # Erlang processes
    "proc_used",
    "proc_total",
    "proc_used_pct",
    # File descriptors
    "fd_used",
    "fd_total",
    # Sockets
    "sockets_used",
    "sockets_total",
    # Run queue (CPU pressure proxy)
    "run_queue",
    # Uptime
    "uptime_sec",
]

QUEUE_COLS = [
    "timestamp",
    "label",
    "vhost",
    "queue",
    "state",
    "consumers",
    "messages_ready",
    "messages_unacked",
    "messages_total",
    # Per-queue rates
    "publish_rate",
    "deliver_rate",
    "ack_rate",
    "redeliver_rate",
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")

def get(session: requests.Session, path: str) -> dict | list:
    url = f"{RMQ_HOST}/api{path}"
    resp = session.get(url, timeout=10)
    resp.raise_for_status()
    return resp.json()

def rate(obj: dict, key: str) -> float:
    """message_stats 안의 rate 값을 안전하게 꺼냅니다."""
    stats = obj.get("message_stats", {})
    detail = stats.get(f"{key}_details", {})
    return round(detail.get("rate", 0.0), 4)

def mb(val: int) -> float:
    return round(val / 1024 / 1024, 2)

def pct(used: int, total: int) -> float:
    return round(used / total * 100, 1) if total else 0.0

def open_csv(path: str, cols: list[str]):
    exists = os.path.isfile(path)
    f = open(path, "a", newline="", encoding="utf-8")
    writer = csv.DictWriter(f, fieldnames=cols)
    if not exists:
        writer.writeheader()
    return f, writer

# ---------------------------------------------------------------------------
# Collectors
# ---------------------------------------------------------------------------

def collect_overview(session, label, writer):
    data = get(session, "/overview")
    mq = data.get("queue_totals", {})
    stats = data.get("message_stats", {})

    def r(key):
        return round(stats.get(f"{key}_details", {}).get("rate", 0.0), 4)

    row = {
        "timestamp": now_iso(),
        "label": label,
        "publish_rate": r("publish"),
        "deliver_rate": r("deliver_get"),
        "ack_rate": r("ack"),
        "redeliver_rate": r("redeliver"),
        "messages_ready": mq.get("messages_ready", 0),
        "messages_unacked": mq.get("messages_unacknowledged", 0),
        "messages_total": mq.get("messages", 0),
        "connection_count": data.get("object_totals", {}).get("connections", 0),
        "channel_count": data.get("object_totals", {}).get("channels", 0),
        "queue_count": data.get("object_totals", {}).get("queues", 0),
        "consumer_count": data.get("object_totals", {}).get("consumers", 0),
    }
    writer.writerow(row)

def collect_nodes(session, label, writer):
    nodes = get(session, "/nodes")
    ts = now_iso()
    for node in nodes:
        mem_used = node.get("mem_used", 0)
        mem_limit = node.get("mem_limit", 1)
        proc_used = node.get("proc_used", 0)
        proc_total = node.get("proc_total", 1)
        fd_used = node.get("fd_used", 0)
        fd_total = node.get("fd_total", 1)
        sock_used = node.get("sockets_used", 0)
        sock_total = node.get("sockets_total", 1)

        row = {
            "timestamp": ts,
            "label": label,
            "node": node.get("name", ""),
            "mem_used_mb": mb(mem_used),
            "mem_limit_mb": mb(mem_limit),
            "mem_used_pct": pct(mem_used, mem_limit),
            "proc_used": proc_used,
            "proc_total": proc_total,
            "proc_used_pct": pct(proc_used, proc_total),
            "fd_used": fd_used,
            "fd_total": fd_total,
            "sockets_used": sock_used,
            "sockets_total": sock_total,
            "run_queue": node.get("run_queue", 0),
            "uptime_sec": round(node.get("uptime", 0) / 1000),
        }
        writer.writerow(row)

def collect_queues(session, label, writer):
    queues = get(session, "/queues")
    ts = now_iso()
    for q in queues:
        row = {
            "timestamp": ts,
            "label": label,
            "vhost": q.get("vhost", "/"),
            "queue": q.get("name", ""),
            "state": q.get("state", ""),
            "consumers": q.get("consumers", 0),
            "messages_ready": q.get("messages_ready", 0),
            "messages_unacked": q.get("messages_unacknowledged", 0),
            "messages_total": q.get("messages", 0),
            "publish_rate": rate(q, "publish"),
            "deliver_rate": rate(q, "deliver_get"),
            "ack_rate": rate(q, "ack"),
            "redeliver_rate": rate(q, "redeliver"),
        }
        writer.writerow(row)

# ---------------------------------------------------------------------------
# Main loop
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="RabbitMQ metrics poller")
    parser.add_argument("--interval", type=int, default=10, help="Polling interval in seconds (default: 10)")
    parser.add_argument("--output", default="./metrics", help="Output directory (default: ./metrics)")
    parser.add_argument("--label", default="default", help="Experiment label written to every row")
    args = parser.parse_args()

    os.makedirs(args.output, exist_ok=True)
    ts_start = datetime.now().strftime("%Y%m%d_%H%M%S")

    overview_path = os.path.join(args.output, f"overview_{ts_start}.csv")
    node_path = os.path.join(args.output, f"node_{ts_start}.csv")
    queue_path = os.path.join(args.output, f"queue_{ts_start}.csv")

    session = requests.Session()
    session.auth = HTTPBasicAuth(RMQ_USER, RMQ_PASS)
    session.verify = True

    # graceful shutdown
    running = True
    def _stop(sig, frame):
        nonlocal running
        print("\nStopping...")
        running = False
    signal.signal(signal.SIGINT, _stop)
    signal.signal(signal.SIGTERM, _stop)

    print(f"Polling {RMQ_HOST} every {args.interval}s  [label={args.label}]")
    print(f"Output → {args.output}/")
    print("Ctrl+C to stop\n")

    with (
        open_csv(overview_path, OVERVIEW_COLS) as (f_ov, w_ov),
        open_csv(node_path, NODE_COLS) as (f_nd, w_nd),
        open_csv(queue_path, QUEUE_COLS) as (f_qu, w_qu),
    ):
        while running:
            try:
                collect_overview(session, args.label, w_ov)
                collect_nodes(session, args.label, w_nd)
                collect_queues(session, args.label, w_qu)

                # flush so data is on disk even if killed
                for f in (f_ov, f_nd, f_qu):
                    f.flush()

                print(f"[{now_iso()}] collected", flush=True)

            except requests.RequestException as e:
                print(f"[{now_iso()}] ERROR: {e}", file=sys.stderr)

            time.sleep(args.interval)

    print("Done.")

if __name__ == "__main__":
    main()
