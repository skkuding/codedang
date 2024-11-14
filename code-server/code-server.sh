#!/usr/bin/env bash

if dpkg -s code-server &>/dev/null; then
    echo 'code-server is installed'
else
    curl -fsSL https://code-server.dev/install.sh | sh
fi

cd /workspace
code-server --config /workspace/code-server/config.yaml