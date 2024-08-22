### BUILDER ###
ARG app_env=production

FROM golang:1.23 AS builder

COPY . /build
WORKDIR /build

RUN go build

### SERVER ###
FROM ubuntu:24.04
ARG app_env

ENV APP_ENV=${app_env}

COPY --from=builder /build/iris .

# Install dependencies
RUN apt update && apt install -y \
  curl gcc g++ openjdk-17-jdk python3.9 \
  && rm -rf /var/lib/apt/lists/*

# Set Python 3.9 as the default Python version
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.9 1 \
  && update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.9 1

# Install sandbox
RUN mkdir -p /app/sandbox/policy /app/sandbox/results \
  && mkdir -p /app/sandbox/logs/run /app/sandbox/logs/compile
RUN chmod -R 770 /app/sandbox

RUN architecture=$(dpkg --print-architecture) && if [ "$architecture" = "arm64" ]; then \
  curl -L "https://github.com/skkuding/codedang/releases/download/alpha/libjudger-arm.so" -o "/app/sandbox/libjudger.so"; \
  else \
  curl -L "https://github.com/skkuding/codedang/releases/download/alpha/libjudger-x64.so" -o "/app/sandbox/libjudger.so"; \
  fi
RUN chmod 750 /app/sandbox/libjudger.so

COPY ./entrypoint.sh .

ENTRYPOINT ["./entrypoint.sh"]
