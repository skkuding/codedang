FROM golang:1.24-alpine AS build

WORKDIR /code
COPY go.mod go.sum /code/
RUN go mod download

COPY *.go /code/
RUN go build -o /code/server

FROM ubuntu:24.04 AS runtime

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
RUN wget -P /tmp https://github.com/ioi/isolate/archive/master.tar.gz \
    && tar -xzvf /tmp/master.tar.gz -C /tmp \
    && mkdir -p /usr/local/etc \
    && cp /tmp/isolate-master/default.cf /usr/local/etc/isolate \
    && make -C /tmp/isolate-master isolate \
    && install /tmp/isolate-master/isolate /usr/local/bin/isolate \
    && isolate --init

# Create a sandbox directory
RUN mkdir /code

WORKDIR /app
COPY --from=build /code/server /app/server

EXPOSE 8000

CMD ["/app/server"]
