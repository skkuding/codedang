FROM golang:1.26-alpine AS build

RUN apk update && apk add --no-cache go

WORKDIR /app

COPY go.mod go.sum /app/
RUN go mod download

COPY *.go /app
RUN go build -o pod-manager

FROM alpine:3.23.3

WORKDIR /app
COPY --from=build /app/pod-manager /app/pod-manager

EXPOSE 8080

CMD ["/app/pod-manager"]
