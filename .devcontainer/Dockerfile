FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:18-bullseye

RUN mkdir -p /app/sandbox/policy /app/sandbox/results \
    && mkdir -p /app/sandbox/logs/run /app/sandbox/logs/compile
RUN chmod -R 777 /app/sandbox

# Install dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends netcat
