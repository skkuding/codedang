FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:20-bullseye

# Install sandbox
RUN mkdir -p /app/sandbox/policy /app/sandbox/results \
  && mkdir -p /app/sandbox/logs/run /app/sandbox/logs/compile
RUN chmod -R 777 /app/sandbox

RUN architecture=$(dpkg --print-architecture) && if [ "$architecture" = "arm64" ]; then \
  curl -L "https://github.com/skkuding/codedang/releases/download/alpha/libjudger-arm.so" -o "/app/sandbox/libjudger.so"; \
  else \
  curl -L "https://github.com/skkuding/codedang/releases/download/alpha/libjudger-x64.so" -o "/app/sandbox/libjudger.so"; \
  fi
RUN chmod 750 /app/sandbox/libjudger.so

# Install dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
  && apt-get -y install --no-install-recommends netcat direnv

# Add go binaries to secure path
RUN echo 'Defaults secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/local/go/bin"' > /etc/sudoers.d/secure_path
RUN chmod 440 /etc/sudoers.d/secure_path

# Install RabbitMQ CLI tool
RUN curl https://raw.githubusercontent.com/rabbitmq/rabbitmq-server/main/deps/rabbitmq_management/bin/rabbitmqadmin -o /usr/local/bin/rabbitmqadmin
RUN chmod 755 /usr/local/bin/rabbitmqadmin

# Install AWS CLI
RUN architecture=$(dpkg --print-architecture) && if [ "$architecture" = "arm64" ]; then \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscli.zip"; \
    else \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscli.zip"; \
    fi \
    && unzip awscli.zip \
    && ./aws/install \
    && rm -rf aws awscli.zip

# Install Java
RUN apt-get -y update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends openjdk-17-jdk