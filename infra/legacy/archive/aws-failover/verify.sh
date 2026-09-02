#!/usr/bin/env bash
set -euo pipefail

archive_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
python3 "$archive_dir/tools/archive.py" verify "$archive_dir"
