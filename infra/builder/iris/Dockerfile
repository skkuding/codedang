# [NOTE] Build image from the root directory of this repository.
# docker build -f infra/builder/iris/Dockerfile .`

# Build Execute Binary File
### BUILDER ###
FROM golang:latest AS builder

COPY ./iris /build
WORKDIR /build

RUN go build

### PRODUCTION ###
FROM golang:latest

ENV APP_ENV=production
COPY --from=builder /build/iris .

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

ENTRYPOINT ["./iris"]
