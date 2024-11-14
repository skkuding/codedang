#!/usr/bin/env bash

if dpkg -s code-server &>/dev/null; then
    echo 'code-server is installed'
else
    curl -fsSL https://code-server.dev/install.sh | sh
fi


# git set up
git config --global --add safe.directory /workspace
git fetch origin

# install golang
cd /workspace
wget https://go.dev/dl/go1.23.3.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.23.3.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin

# code-server start
code-server --config /workspace/code-server/config.yaml /workspace