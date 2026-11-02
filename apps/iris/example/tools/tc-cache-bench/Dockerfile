# TAS-3060 local measurement image. Build from repository root:
# docker build -f apps/iris/example/tools/tc-cache-bench/Dockerfile \
#   -t codedang-tc-cache-bench:tas3060 apps/iris
# Unlike the Iris runtime image, this only runs the TC loader, not Judger.
FROM golang:1.25 AS builder
WORKDIR /build
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download
COPY . .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 go build -o /tc-cache-bench ./example/tools/tc-cache-bench

FROM busybox:1.37.0
COPY --from=builder /tc-cache-bench /usr/local/bin/tc-cache-bench
ENTRYPOINT ["/usr/local/bin/tc-cache-bench"]
