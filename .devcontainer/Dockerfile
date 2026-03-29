FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:22-bullseye

# Install sandbox
RUN mkdir -p /app/sandbox/policy /app/sandbox/results /app/sandbox/logs/run /app/sandbox/logs/compile
RUN chmod -R 777 /app/sandbox

RUN curl -L "https://github.com/skkuding/Judger/releases/download/v1.0.0-alpha.4/libjudger-$(dpkg --print-architecture).so" -o "/app/sandbox/libjudger.so"
RUN chmod 750 /app/sandbox/libjudger.so

COPY ./apps/iris/lib/testlib.h /usr/include/testlib.h

# Install dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
  && apt-get -y install --no-install-recommends pypy3 \
  && rm -rf /var/lib/apt/lists/*

# Add go binaries to secure path
RUN echo 'Defaults secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/local/go/bin"' > /etc/sudoers.d/secure_path
RUN chmod 440 /etc/sudoers.d/secure_path

# Install AWS CLI
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-$(uname -m).zip" -o awscli.zip \
  && unzip awscli.zip \
  && ./aws/install \
  && rm -rf aws awscli.zip

RUN apt-get -y update && export DEBIAN_FRONTEND=noninteractive \
  && apt-get -y install --no-install-recommends \
  && apt-get -y clean \
  && rm -rf /var/lib/apt/lists/*

ENV JAVA_PATH=/usr/local/sdkman/candidates/java/current/bin/
