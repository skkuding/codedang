#!/usr/bin/env bash

if dpkg -s code-server &>/dev/null; then
    echo 'code-server is installed'
else
    curl -fsSL https://code-server.dev/install.sh | sh
fi


# git set up
cd /workspace
source ./code-server/git.sh

# install golang
rm -rf /usr/local/go
rm -rf /workspace/go1.23.3.*
wget https://go.dev/dl/go1.23.3.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.23.3.linux-amd64.tar.gz
echo "export PATH=$PATH:/usr/local/go/bin" >> ~/.bashrc
source ~/.bashrc

# postcreated script
source ./scripts/setup.sh

# code-server start
./code-server/extensions.sh
code-server --config /workspace/code-server/config.yaml /workspace
