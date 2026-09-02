#!/usr/bin/env python3
"""Sanitize AWS archive input and verify the resulting offline archive."""

import argparse
import base64
import collections
import json
import re
import sys
from pathlib import Path

ACCOUNT = "219857217698"
SNAPSHOT_DATE = "2026-08-27"
FAMILIES = [
    "Codedang-Admin-Api",
    "Codedang-Client-Api",
    "Codedang-Iris-Api",
    "Codedang-Proxy",
    "api-jaeger-test",
    "api-server",
    "datadog-agent-task",
    "loki-fargate-task-definition",
    "mini-test",
]
EXPECTED_REVISIONS = 297
EXPECTED_COUNTS = {
    "Codedang-Admin-Api": {"ACTIVE": 18, "INACTIVE": 56},
    "Codedang-Client-Api": {"ACTIVE": 26, "INACTIVE": 78},
    "Codedang-Iris-Api": {"ACTIVE": 9, "INACTIVE": 66},
    "Codedang-Proxy": {"INACTIVE": 15},
    "api-jaeger-test": {"ACTIVE": 21},
    "api-server": {"INACTIVE": 1},
    "datadog-agent-task": {"ACTIVE": 1},
    "loki-fargate-task-definition": {"ACTIVE": 4},
    "mini-test": {"ACTIVE": 2},
}
OMIT = object()
REDACTED = "[OMITTED: potentially sensitive]"

SECRET_KEY = re.compile(
    r"(?:pass(?:word)?|secret|token|credential|authorization|api[-_]?key|private[-_]?key|client[-_]?secret|user[-_]?data)",
    re.I,
)
PRIVATE_KEY = re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")
ACCESS_KEY = re.compile(r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b")
JWT = re.compile(r"\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b")
KNOWN_TOKEN = re.compile(r"\b(?:gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{30,})\b")
URI_USERINFO = re.compile(r"[a-z][a-z0-9+.-]*://[^\s/@:]+:[^\s/@]+@", re.I)
ASSIGNMENT_SECRET = re.compile(
    r"(?:pass(?:word)?|secret|token|credential|authorization|api[-_]?key)\s*(?:=|:)", re.I
)
OPAQUE = re.compile(r"^[A-Za-z0-9+/=_-]{48,}$")
SAFE_OPAQUE = re.compile(
    r"^(?:arn:aws:|sha256:|[a-z]+-[0-9a-f]+$|[a-z]{1,8}-[0-9a-f]{8,}$|[0-9a-f]{32,64}$)", re.I
)


def sensitive_string(value):
    if strongly_sensitive_string(value):
        return True
    return bool(OPAQUE.fullmatch(value) and not SAFE_OPAQUE.match(value))


def strongly_sensitive_string(value):
    return bool(
        PRIVATE_KEY.search(value)
        or ACCESS_KEY.search(value)
        or JWT.search(value)
        or KNOWN_TOKEN.search(value)
        or URI_USERINFO.search(value)
        or ASSIGNMENT_SECRET.search(value)
    )


def clean_string(value):
    return REDACTED if sensitive_string(value) else value


def clean_generic(value, key=""):
    if isinstance(value, dict):
        result = {}
        for child_key in sorted(value):
            if child_key == "ResponseMetadata":
                continue
            if SECRET_KEY.search(child_key):
                result[child_key] = REDACTED
                continue
            if child_key in {"GeneralLogGroup", "AuditLogGroup"} and isinstance(value[child_key], str):
                result[child_key] = REDACTED if strongly_sensitive_string(value[child_key]) else value[child_key]
                continue
            result[child_key] = clean_generic(value[child_key], child_key)
        return result
    if isinstance(value, list):
        cleaned = [clean_generic(item, key) for item in value]
        if all(isinstance(item, dict) for item in cleaned):
            return sorted(cleaned, key=lambda item: json.dumps(item, sort_keys=True, separators=(",", ":")))
        return cleaned
    if isinstance(value, str):
        return clean_string(value)
    return value


def clean_values(value):
    """Clean values in an explicitly whitelisted structure without treating metadata keys as secrets."""
    if isinstance(value, dict):
        return {key: clean_values(value[key]) for key in sorted(value)}
    if isinstance(value, list):
        return [clean_values(item) for item in value]
    if isinstance(value, str):
        return clean_string(value)
    return value


def pick(source, keys):
    return {key: source[key] for key in keys if key in source}


def safe_sequence(container, key):
    if key not in container:
        return OMIT
    values = container[key]
    if not isinstance(values, list) or not all(isinstance(value, str) for value in values):
        return OMIT
    if any(sensitive_string(value) for value in values):
        return REDACTED
    return values


def sanitize_container(container):
    safe = pick(
        container,
        [
            "name", "image", "cpu", "memory", "memoryReservation", "essential",
            "disableNetworking", "privileged", "readonlyRootFilesystem", "interactive",
            "pseudoTerminal", "startTimeout", "stopTimeout", "hostname", "user",
            "workingDirectory", "portMappings", "mountPoints", "volumesFrom", "dependsOn",
            "linuxParameters", "firelensConfiguration", "resourceRequirements",
            "restartPolicy", "links", "dnsServers", "dnsSearchDomains", "extraHosts",
            "dockerSecurityOptions", "dockerLabels", "ulimits", "systemControls",
            "credentialSpecs", "versionConsistency",
        ],
    )
    for key in ("command", "entryPoint"):
        value = safe_sequence(container, key)
        if value is not OMIT:
            safe[key] = value
    if "environment" in container:
        safe["environment"] = sorted(
            ({"name": item["name"]} for item in container["environment"] if "name" in item),
            key=lambda item: item["name"],
        )
    if "environmentFiles" in container:
        safe["environmentFiles"] = [
            pick(item, ["type", "value"]) for item in container["environmentFiles"]
        ]
    if "secrets" in container:
        safe["secrets"] = sorted(
            (pick(item, ["name", "valueFrom"]) for item in container["secrets"]),
            key=lambda item: (item.get("name", ""), item.get("valueFrom", "")),
        )
    if "repositoryCredentials" in container:
        safe["repositoryCredentials"] = pick(container["repositoryCredentials"], ["credentialsParameter"])
    if "healthCheck" in container:
        health = pick(container["healthCheck"], ["interval", "timeout", "retries", "startPeriod"])
        command = safe_sequence(container["healthCheck"], "command")
        if command is not OMIT:
            health["command"] = command
        safe["healthCheck"] = health
    if "logConfiguration" in container:
        log = pick(container["logConfiguration"], ["logDriver", "secretOptions"])
        if "options" in container["logConfiguration"]:
            log["options"] = {
                key: clean_string(str(value))
                for key, value in sorted(container["logConfiguration"]["options"].items())
            }
        if "secretOptions" in log:
            log["secretOptions"] = sorted(
                (pick(item, ["name", "valueFrom"]) for item in log["secretOptions"]),
                key=lambda item: (item.get("name", ""), item.get("valueFrom", "")),
            )
        safe["logConfiguration"] = log
    return clean_values(safe)


def sanitize_ecs(payload):
    task = payload["taskDefinition"]
    result = pick(
        task,
        [
            "taskDefinitionArn", "family", "revision", "status", "registeredAt", "registeredBy",
            "deregisteredAt",
            "taskRoleArn", "executionRoleArn", "networkMode", "cpu", "memory", "pidMode", "ipcMode",
            "proxyConfiguration", "inferenceAccelerators", "ephemeralStorage", "runtimePlatform",
            "requiresAttributes", "placementConstraints", "compatibilities", "requiresCompatibilities",
            "volumes", "enableFaultInjection",
        ],
    )
    result["containerDefinitions"] = sorted(
        (sanitize_container(container) for container in task.get("containerDefinitions", [])),
        key=lambda container: container.get("name", ""),
    )
    result["tags"] = sorted(
        (clean_generic(pick(tag, ["key", "value"])) for tag in payload.get("tags", [])),
        key=lambda tag: (tag.get("key", ""), tag.get("value", "")),
    )
    return clean_values(result)


def sanitize_mq_configuration(payload):
    result = clean_generic({key: value for key, value in payload.items() if key != "Data"})
    result["Revision"] = 1
    if "Data" in payload:
        try:
            decoded = base64.b64decode(payload["Data"], validate=True).decode("utf-8")
        except (ValueError, UnicodeDecodeError):
            decoded = ""
        result["Data"] = decoded if decoded and not sensitive_string(decoded) else REDACTED
    return result


def canonical_dump(value, stream=sys.stdout):
    json.dump(value, stream, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    stream.write("\n")


def fingerprint(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"))


def dimension_value(task, dimension):
    containers = task.get("containerDefinitions", [])
    if dimension == "environmentNames":
        return {container.get("name", ""): [item["name"] for item in container.get("environment", [])] for container in containers}
    if dimension == "images":
        return sorted({container.get("image", "") for container in containers})
    if dimension == "commandsAndEntrypoints":
        return {
            container.get("name", ""): pick(container, ["command", "entryPoint"])
            for container in containers if "command" in container or "entryPoint" in container
        }
    if dimension == "logging":
        return {container.get("name", ""): container.get("logConfiguration") for container in containers if "logConfiguration" in container}
    structural_task = pick(task, [
        "networkMode", "cpu", "memory", "pidMode", "ipcMode", "proxyConfiguration",
        "inferenceAccelerators", "ephemeralStorage", "runtimePlatform", "placementConstraints",
        "requiresCompatibilities", "volumes", "enableFaultInjection",
    ])
    structural_task["containers"] = [
        pick(container, [
            "name", "cpu", "memory", "memoryReservation", "essential", "disableNetworking",
            "privileged", "readonlyRootFilesystem", "startTimeout", "stopTimeout", "portMappings",
            "mountPoints", "volumesFrom", "dependsOn", "linuxParameters", "firelensConfiguration",
            "resourceRequirements", "healthCheck", "restartPolicy", "links", "dnsServers",
            "dnsSearchDomains", "extraHosts", "dockerSecurityOptions", "dockerLabels", "ulimits",
            "systemControls", "credentialSpecs", "versionConsistency",
        ]) for container in containers
    ]
    return structural_task


def ranges(tasks, dimension):
    output = []
    for task in tasks:
        value = dimension_value(task, dimension)
        signature = fingerprint(value)
        if output and output[-1]["_signature"] == signature and output[-1]["revisionEnd"] + 1 == task["revision"]:
            output[-1]["revisionEnd"] = task["revision"]
        else:
            output.append({"revisionStart": task["revision"], "revisionEnd": task["revision"], "value": value, "_signature": signature})
    for item in output:
        del item["_signature"]
    return output


def load_tasks(path):
    tasks = []
    with path.open() as stream:
        for line_number, line in enumerate(stream, 1):
            try:
                tasks.append(json.loads(line))
            except json.JSONDecodeError as error:
                raise SystemExit(f"invalid NDJSON at line {line_number}: {error}") from error
    return tasks


def build_manifest(tasks, extraction_date):
    counts = collections.defaultdict(lambda: collections.Counter())
    for task in tasks:
        counts[task["family"]][task["status"]] += 1
    return {
        "account": ACCOUNT,
        "region": "ap-northeast-2",
        "extractedOn": extraction_date,
        "revisionCount": len(tasks),
        "countsByFamilyAndStatus": {
            family: dict(sorted(statuses.items())) for family, statuses in sorted(counts.items())
        },
        "schema": "One canonical JSON object per line, ordered by family and numeric revision.",
        "redactionPolicy": [
            "Environment entries retain names only; values are never archived.",
            "Secret references retain names and reference metadata but no fetched secret value.",
            "Credential-like strings, URI userinfo, private keys, and suspicious opaque values are omitted.",
            "Commands and entrypoints are retained only when every element passes the secret scanner.",
        ],
    }


def build_change_index(tasks):
    index = {"dimensions": ["structural", "environmentNames", "images", "commandsAndEntrypoints", "logging"], "families": {}}
    by_family = collections.defaultdict(list)
    for task in tasks:
        by_family[task["family"]].append(task)
    for family in sorted(by_family):
        family_tasks = sorted(by_family[family], key=lambda task: task["revision"])
        index["families"][family] = {
            dimension: ranges(family_tasks, dimension) for dimension in index["dimensions"]
        }
    return index


def derive(root):
    revisions_path = root / "ecs-task-definitions/revisions.ndjson"
    tasks = load_tasks(revisions_path)
    manifest = build_manifest(tasks, SNAPSHOT_DATE)
    index = build_change_index(tasks)
    with (root / "ecs-task-definitions/manifest.json").open("w") as stream:
        canonical_dump(manifest, stream)
    with (root / "ecs-task-definitions/change-index.json").open("w") as stream:
        canonical_dump(index, stream)


def verify(root):
    failures = []
    tasks = load_tasks(root / "ecs-task-definitions/revisions.ndjson")
    keys = [(task.get("family"), task.get("revision")) for task in tasks]
    if len(tasks) != EXPECTED_REVISIONS:
        failures.append(f"expected {EXPECTED_REVISIONS} revisions, found {len(tasks)}")
    if keys != sorted(keys, key=lambda item: (item[0], item[1])):
        failures.append("revisions are not sorted by family and numeric revision")
    if len(keys) != len(set(keys)):
        failures.append("duplicate family/revision pairs")
    if sorted(set(task.get("family") for task in tasks)) != sorted(FAMILIES):
        failures.append("family inventory differs from the expected nine families")
    actual_counts = collections.defaultdict(collections.Counter)
    for task in tasks:
        actual_counts[task.get("family")][task.get("status")] += 1
    if {family: dict(statuses) for family, statuses in actual_counts.items()} != EXPECTED_COUNTS:
        failures.append("family/status counts differ from the extraction manifest")
    for task in tasks:
        for container in task.get("containerDefinitions", []):
            if any(set(item) != {"name"} for item in container.get("environment", [])):
                failures.append(f"environment value found in {task.get('family')}:{task.get('revision')}")
    parsed_json = {}
    for path in sorted(root.rglob("*.json")):
        try:
            parsed_json[path] = json.loads(path.read_text())
        except json.JSONDecodeError as error:
            failures.append(f"invalid JSON {path.relative_to(root)}: {error}")
    manifest_path = root / "ecs-task-definitions/manifest.json"
    index_path = root / "ecs-task-definitions/change-index.json"
    if parsed_json.get(manifest_path) != build_manifest(tasks, SNAPSHOT_DATE):
        failures.append("manifest.json does not exactly match revisions.ndjson derivation")
    if parsed_json.get(index_path) != build_change_index(tasks):
        failures.append("change-index.json does not exactly match revisions.ndjson derivation")
    scan_patterns = [PRIVATE_KEY, ACCESS_KEY, JWT, KNOWN_TOKEN, URI_USERINFO, ASSIGNMENT_SECRET]
    for path in sorted(item for item in root.rglob("*") if item.is_file() and item.name != "archive.py"):
        text = path.read_text(errors="replace")
        for pattern in scan_patterns:
            if pattern.search(text):
                failures.append(f"secret pattern {pattern.pattern!r} in {path.relative_to(root)}")
    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        raise SystemExit(1)
    print(f"verified {len(tasks)} ECS revisions and {sum(1 for item in root.rglob('*') if item.is_file())} archive files")


def main():
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("sanitize-ecs")
    subparsers.add_parser("sanitize-json")
    subparsers.add_parser("sanitize-mq-configuration")
    subparsers.add_parser("sanitize-text")
    derive_parser = subparsers.add_parser("derive")
    derive_parser.add_argument("root", type=Path)
    verify_parser = subparsers.add_parser("verify")
    verify_parser.add_argument("root", type=Path)
    arguments = parser.parse_args()
    if arguments.command == "sanitize-ecs":
        canonical_dump(sanitize_ecs(json.load(sys.stdin)))
    elif arguments.command == "sanitize-json":
        canonical_dump(clean_generic(json.load(sys.stdin)))
    elif arguments.command == "sanitize-mq-configuration":
        canonical_dump(sanitize_mq_configuration(json.load(sys.stdin)))
    elif arguments.command == "sanitize-text":
        text = sys.stdin.read()
        if sensitive_string(text) or any(sensitive_string(line.strip()) for line in text.splitlines()):
            raise SystemExit("refusing to archive potentially sensitive text")
        sys.stdout.write(text)
    elif arguments.command == "derive":
        derive(arguments.root)
    else:
        verify(arguments.root)


if __name__ == "__main__":
    main()
