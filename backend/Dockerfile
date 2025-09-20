FROM golang:latest
WORKDIR /app
COPY --from=ghcr.io/typst/typst:v0.13.1 /bin/typst /bin/typst
COPY --from=ghcr.io/typst/typst:v0.13.1 /lib/ld-musl-x86_64.so.1 /lib/ld-musl-x86_64.so.1

RUN go install github.com/air-verse/air@latest

COPY go.mod go.sum ./
RUN go mod download

COPY --exclude=tmp . /app
RUN mkdir tmp

CMD ["air"]
