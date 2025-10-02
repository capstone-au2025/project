FROM golang:latest AS typst-wrapper
WORKDIR /app
COPY typst-wrapper /app
RUN go get -u
RUN go mod tidy
ENV CGO_ENABLED=0
RUN go build

FROM golang:latest
WORKDIR /app
COPY --from=ghcr.io/typst/typst:v0.13.1 /bin/typst /bin/typst
COPY --from=ghcr.io/typst/typst:v0.13.1 /lib/ld-musl-x86_64.so.1 /lib/ld-musl-x86_64.so.1
COPY --from=typst-wrapper /app/typst-wrapper /bin/typst-wrapper

RUN go install github.com/air-verse/air@latest

COPY go.mod go.sum ./
RUN go mod download

COPY . /app

CMD ["air"]
