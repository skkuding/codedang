### BUILDER ###
ARG app_env=production

FROM golang:1.27.3 AS builder

COPY . /build
WORKDIR /build

RUN go build

### SERVER ###
FROM ubuntu:24.04
ARG app_env

ENV APP_ENV=${app_env}

# The eMudhra intermediate CA compromise requires a patched trust store even
# though Go performs its own SPKI-based block. Fail the build rather than ship
# an image with an older ca-certificates package.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && installed="$(dpkg-query -W -f='${Version}' ca-certificates)" \
  && dpkg --compare-versions "$installed" ge '20260816ubuntu0.24.04.1' \
  && echo "ca-certificates ${installed}" \
  && rm -rf /var/lib/apt/lists/*

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
