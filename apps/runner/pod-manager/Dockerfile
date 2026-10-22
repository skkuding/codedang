FROM golang:1.27.3-alpine AS build

WORKDIR /app

COPY go.mod go.sum /app/
RUN go mod download

COPY *.go /app
RUN go build -o pod-manager

FROM alpine:3.21.3

# The eMudhra intermediate CA compromise requires a patched trust store.
RUN apk add --no-cache 'ca-certificates>=20261020-r0'

WORKDIR /app
COPY --from=build /app/pod-manager /app/pod-manager

EXPOSE 8080

CMD ["/app/pod-manager"]
