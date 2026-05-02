### BUILDER ###
ARG app_env=production

FROM golang:1.26 AS builder

COPY . /build
WORKDIR /build

RUN go build

### SERVER ###
FROM ubuntu:24.04
ARG app_env

ENV APP_ENV=${app_env}

# Install dependencies
RUN apt update && apt install -y \
  curl gcc g++ openjdk-17-jdk \
  software-properties-common \
  && add-apt-repository ppa:pypy/ppa \
  && apt update \
  && apt install -y pypy3 \
  && rm -rf /var/lib/apt/lists/*

# Install sandbox
RUN mkdir -p /app/sandbox/policy /app/sandbox/results \
  && mkdir -p /app/sandbox/logs/run /app/sandbox/logs/compile
RUN chmod -R 770 /app/sandbox

RUN architecture=$(dpkg --print-architecture) && if [ "$architecture" = "arm64" ]; then \
  curl -L "https://github.com/skkuding/Judger/releases/download/v1.0.0-alpha.4/libjudger-arm64.so" -o "/app/sandbox/libjudger.so"; \
  else \
  curl -L "https://github.com/skkuding/Judger/releases/download/v1.0.0-alpha.4/libjudger-amd64.so" -o "/app/sandbox/libjudger.so"; \
  fi
RUN chmod 750 /app/sandbox/libjudger.so

COPY --from=builder /build/iris .

COPY ./entrypoint.sh .
ENV JAVA_PATH /usr/bin/
ENTRYPOINT ["./entrypoint.sh"]
