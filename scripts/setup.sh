#!/usr/bin/env bash

# This script sets up the development environment for Codedang.
# Should support both local machine(MacOS/Linux) and devcontainer.

set -e

BASEDIR=$(dirname $(dirname $(realpath "$0")))
cd "$BASEDIR"

if [ -z "$DEVCONTAINER" ]; then
  docker compose up -d
fi

# Install nvm
if [ -z "$NVM_DIR" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
  NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
fi

# Install Node.js
. "$NVM_DIR/nvm.sh" || true
nvm install

# Install direnv
if [ ! $(command -v direnv) ]; then
  curl -sfL https://direnv.net/install.sh | bash
  echo 'eval "$(direnv hook bash)"' >> ~/.bashrc
  echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
fi
direnv allow .
eval "$(direnv export bash)"

# If .env does not exist, create one
if [ ! -f apps/backend/.env ] || ! grep -q "DATABASE_URL" apps/backend/.env; then
  cp apps/backend/.env.example apps/backend/.env
fi

if [ ! -f apps/frontend/.env ]; then
  cp apps/frontend/.env.example apps/frontend/.env
fi

if [ ! -f apps/iris/.env ]; then
  cp apps/iris/.env.example apps/iris/.env
fi

if [ ! -f apps/plag/.env ]; then
  cp apps/plag/.env.example apps/plag/.env
fi

# Backward compatibility: remove old .env file
rm -f .env

# Install pnpm and Node.js packages
corepack enable
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 pnpm install

# Install lefthook for git hook
pnpm exec lefthook install

# Enable git auto completion
if [ "$DEVCONTAINER" = "1" ] && ! grep -q "source /usr/share/bash-completion/completions/git" ~/.bashrc; then
  echo "source /usr/share/bash-completion/completions/git" >> ~/.bashrc
fi

# Apply database migration
for _ in {1..5}; do
  pnpm --filter="@codedang/backend" exec prisma migrate dev && break # break if migration succeed
  echo -e '\n⚠️ Failed to migrate. Waiting for db to be ready...\n'
  sleep 5
done

# Initialize MinIO
pnpm run init:storage

# Initialize RabbitMQ
pnpm run init:rabbitmq

# Install Go dependencies
cd "$BASEDIR"/apps/iris
go get

# Setup sandbox (only for devcontainer)
if [ "$DEVCONTAINER" = "1" ]; then
  cp "$BASEDIR"/apps/iris/lib/judger/policy/java_policy /app/sandbox/policy/

  SANDBOX_DIR="/sys/fs/cgroup/sandbox-${CONTAINER_ID}"
  SUDO=$([[ $UID -ne 0 ]] && echo "sudo")
  $SUDO mkdir -p "$SANDBOX_DIR"

  # Allow subgroups to access memory controller
  $SUDO echo "+memory" | $SUDO tee "$SANDBOX_DIR/cgroup.subtree_control"

  # Setup sdk manager for jdk version control in plag and iris
  $SUDO echo "sdkman_auto_env=true" >> /usr/local/sdkman/etc/config

  $SUDO mkdir -p /app/sandbox/checks
  $SUDO chmod 777 /app/sandbox/checks
  $SUDO curl -L "https://github.com/jplag/JPlag/releases/download/v6.2.0/jplag-6.2.0-jar-with-dependencies.jar" -o "/app/sandbox/jplag.jar"
fi

echo ""
echo "✅ Codedang setup has been completed!"
echo ""
