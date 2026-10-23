FROM golang:1.27.3-alpine AS build

WORKDIR /code
COPY go.mod go.sum /code/
RUN go mod download

COPY *.go /code/
RUN go build -o /code/server

FROM ubuntu:24.04 AS runtime

# The eMudhra intermediate CA compromise requires a patched trust store.
# golang-go below is the toolchain for user submissions, not a TLS client.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && installed="$(dpkg-query -W -f='${Version}' ca-certificates)" \
    && dpkg --compare-versions "$installed" ge '20260816ubuntu0.24.04.1' \
    && echo "ca-certificates ${installed}" \
    && rm -rf /var/lib/apt/lists/*

RUN apt update && apt install -y \
    wget \
    golang-go \
    nodejs \
    npm \
    python3 \
    python3-pip \
    openjdk-11-jdk \
    build-essential \
    libcap-dev \
    pkg-config \
    libsystemd-dev

# Install isolate (https://github.com/ioi/isolate)
RUN wget -P /tmp https://github.com/ioi/isolate/archive/refs/tags/v2.2.1.tar.gz \
    && tar -xzvf /tmp/v2.2.1.tar.gz -C /tmp \
    && make -C /tmp/isolate-2.2.1 isolate default.cf \
    && mkdir -p /usr/local/etc \
    && cp /tmp/isolate-2.2.1/default.cf /usr/local/etc/isolate \
    && install /tmp/isolate-2.2.1/isolate /usr/local/bin/isolate \
    && rm -rf /tmp/v2.2.1.tar.gz /tmp/isolate-2.2.1 \
    && isolate --init

# Create a sandbox directory
RUN mkdir /code

WORKDIR /app
COPY --from=build /code/server /app/server

EXPOSE 8000

CMD ["/app/server"]
