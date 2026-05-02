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
# JDK21이 필요합니다.
RUN apt update && apt install -y \
  curl openjdk-21-jdk \
  software-properties-common \
  && apt update \
  && rm -rf /var/lib/apt/lists/*

# Install sandbox
RUN mkdir -p /app/sandbox/checks \
  && mkdir -p /app/sandbox/logs/run /app/sandbox/logs/compile
RUN chmod -R 770 /app/sandbox

RUN curl -L "https://github.com/jplag/JPlag/releases/download/v6.2.0/jplag-6.2.0-jar-with-dependencies.jar" -o "/app/sandbox/jplag.jar";

RUN chmod 750 /app/sandbox/jplag.jar

COPY --from=builder /build/plag .

COPY ./entrypoint.sh .
ENV JAVA_PATH /usr/bin/
ENTRYPOINT ["./entrypoint.sh"]
