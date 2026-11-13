FROM golang:1.26.4-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY *.go ./
COPY fixtures ./fixtures
RUN CGO_ENABLED=0 go build -trimpath -o /tc-cache .

FROM build AS test-build
RUN CGO_ENABLED=0 go test -c -trimpath -o /verify .

FROM scratch AS runtime
COPY --from=build /tc-cache /tc-cache
ENTRYPOINT ["/tc-cache"]

FROM runtime AS verify
COPY --from=test-build /verify /verify
ENTRYPOINT ["/verify", "-test.v", "-test.timeout=2m"]
