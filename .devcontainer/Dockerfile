FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:18-bullseye

RUN architecture=$(dpkg --print-architecture) \
    && if [ "$architecture" = "arm64" ]; then \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscli.zip"; \
    else \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscli.zip"; \
    fi \
    && unzip awscli.zip \
    && ./aws/install \
    && rm -rf aws awscli.zip
