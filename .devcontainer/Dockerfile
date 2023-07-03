FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:18-bullseye

# Install dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends netcat
