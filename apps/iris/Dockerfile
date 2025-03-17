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
  curl gcc g++ openjdk-17-jdk \
  && rm -rf /var/lib/apt/lists/*

# Install sandbox
RUN mkdir -p /app/sandbox/policy /app/sandbox/results \
  && mkdir -p /app/sandbox/logs/run /app/sandbox/logs/compile
RUN chmod -R 770 /app/sandbox

RUN architecture=$(dpkg --print-architecture) && if [ "$architecture" = "arm64" ]; then \
  curl -L "https://github.com/skkuding/Judger/releases/download/v1.0.0-alpha/libjudger-arm64.a" -o "/app/sandbox/libjudger.a"; \
  else \
  curl -L "https://github.com/skkuding/Judger/releases/download/v1.0.0-alpha/libjudger-amd64.a" -o "/app/sandbox/libjudger.a"; \
  fi
RUN chmod 750 /app/sandbox/libjudger.a

COPY ./entrypoint.sh .

ENTRYPOINT ["./entrypoint.sh"]
